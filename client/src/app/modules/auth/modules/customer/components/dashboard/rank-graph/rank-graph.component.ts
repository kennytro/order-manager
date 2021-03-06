import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { Subject, of } from 'rxjs';
import { take, takeUntil, map } from 'rxjs/operators';
import * as moment from 'moment';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import compact from 'lodash/compact';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-rank-graph',
  templateUrl: './rank-graph.component.html',
  styleUrls: ['./rank-graph.component.css']
})
export class RankGraphComponent implements OnInit {
  showSpinner:boolean;
  ranges = [
    { label: '30 Days', cutOffDate: moment().subtract(30, 'days').toDate() },
    { label: '60 Days', cutOffDate: moment().subtract(60, 'days').toDate() },
    { label: '90 Days', cutOffDate: moment().subtract(90, 'days').toDate() }    
  ];
  rangeSelection: FormControl;

  limits = ['10', '20', '30'];
  limitSelection: FormControl;
  rankChart: GoogleChartInterface;

  private _unsubscribe = new Subject<boolean>();
  private _instanceMap = new Map();
  private _cutOffDate: Date;
  private _limit: number;

  @Input() metricName: string;
  private _metricDefinition: any;

  @Input() chartTitle: string;
  @Input() chartType: string = 'BarChart';

  private _instanceId: string;
  @Input()
  set instanceId(id: string) {
    if (id && this._instanceId !== id) {
      this._instanceId = id;
      // update chart only if the chart component exists. otherwise
      // ngOnInit() will update the chart later.
      if (this.rankChart) {
        this._updateChart(false);
      }
    }
  }
  get instanceId(): string { return this._instanceId; }


  constructor(private _dataApi: DataApiService) {
    this._limit = Number(this.limits[0]);
    this._cutOffDate = this.ranges[0].cutOffDate;
  }

  ngOnInit() {
    this.showSpinner = true;
    this.rangeSelection = new FormControl(this.ranges[0].label);
    this.rangeSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(rangeLabel => {
        let rangeInfo = this.ranges.find(element => element.label === rangeLabel);
        if (this._cutOffDate !== rangeInfo.cutOffDate) {
          this._cutOffDate = rangeInfo.cutOffDate;
          this._updateChart(false);
        }
      });

    this.limitSelection = new FormControl(this.limits[0]);
    this.limitSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(limit => {
        let newLimit = Number(limit);
        if (this._limit !== newLimit) {
          this._limit = newLimit;
          this._updateChart(false);
        }
      });

    this._dataApi.genericMethod('Metric', 'findOne', [{ where: { name: this.metricName } }])
      .pipe(take(1))
      .subscribe(metric => {
        if (metric) {
          this._metricDefinition = metric;
          this._setInstanceMap(metric)
          .subscribe(instanceCount => {
            this._updateChart(true);
          });
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  onReadyChart() {
    console.log(`rank graph chart(${this.metricName}) is ready`);
    this.showSpinner = false;
  }

  private _initializeChart(metric, dataTable) {
    let colorName = this._getColorName(metric.modelName);
    this.rankChart = {
      chartType: this.chartType,
      dataTable: dataTable,
      options: {
        title: (this.chartTitle) ? undefined : metric.displayName,
        // width: 400,
        colors: [colorName],
        chartArea: { top: 20, left: 20 },
        height: this._getChartHeight(dataTable.length),
        legend: { position: 'none' },
        vAxis: { title: '', textPosition: 'in' },
        hAxis: { title: metric.unitLabel, format: (metric.unit === 'Currency') ? '$#' : undefined },
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        }
      }
    };
  }

  private _setInstanceMap(metric) {
    if (metric.modelName !== 'System') {
      return this._dataApi.find(metric.modelName, { fields: { id: true, name: true } })
      .pipe(take(1), map(instances => {
         instances.forEach(instance => this._instanceMap.set(instance.id.toString(), instance.name));
         return instances.length;
      }));
    } else {
      return of(0);
    }
  }

  private _updateChart(init: boolean) {
    if (this._metricDefinition.adHoc) {
      if (this._instanceId) {
        this._dataApi.genericMethod('Metric', 'findAdHocMetricData',
          [this._metricDefinition, { metricDate: { gt: this._cutOffDate } }, this._instanceId])
        .pipe(take(1))
        .subscribe(data => {
          let newDataTable = this._getDataTableFromMetricData(data);
          if (this.rankChart) {
            this.rankChart.dataTable = newDataTable;
            this.rankChart.options['height'] = this._getChartHeight(newDataTable.length);
            this.rankChart.component.draw();            
          } else {
            this._initializeChart(this._metricDefinition, newDataTable);
          }
        });
      }
    } else {
      this._dataApi.genericMethod('Metric', 'findMetricDataByName',
        [[this._metricDefinition.name],
        { metricDate: { gt: this._cutOffDate } }])
        .pipe(take(1))
        .subscribe(data => {
          let newDataTable = this._getDataTableFromMetricData(data);
          if (init) {
            this._initializeChart(this._metricDefinition, newDataTable);
          } else {
            this.rankChart.dataTable = newDataTable;
            this.rankChart.options['height'] = this._getChartHeight(newDataTable.length);
            this.rankChart.component.draw();
          }
        });
    }
  }

  private _getColorName(modelName: string) : string {
    const colorScheme = [
      { modelName: 'Client', colorName: 'gold' },
      { modelName: 'Product', colorName: 'green' },
      { modelName: 'DeliveryRoute', colorName: 'brown' }
    ];
    let colorInfo = colorScheme.find((info) => info.modelName === modelName);
    if (colorInfo) {
      return colorInfo.colorName;
    }
    return 'blue';    // default color
  }

  private _getChartHeight(rowCount: number) : number {
    if (rowCount < 5) {
      return 300;
    }
    if (rowCount < 10) {
      return 400;
    }
    if (rowCount < 20) {
      return 800;
    }
    return 1000;
  }

  /**
   * Make a chart data table using metric data.
   * @params{Object[]} metricData
   * @returns{Object[]} chart data table
   */
  private _getDataTableFromMetricData(metricData: any[]) :any[] {
    let grouped = groupBy(metricData, 'instanceId');
    let ids = keys(grouped);
    let newData = ids.map(id => {
      let instanceName = this._instanceMap.get(id);
      if (instanceName) {
        let total = grouped[id].reduce((sum, mData) => sum + Number(mData.value), 0);
        return { name: instanceName, value: total };
      }
      return null;
    });
    newData = compact(newData);
    newData.sort((a, b) => b.value - a.value);
    newData.splice(this._limit);
    let newDataTable = [];
    if (newData.length === 0) {
      newDataTable = [['', {role: 'annotation'}], ['', '']];
    } else {
      newDataTable = [[this._metricDefinition.modelName, this._metricDefinition.unitLabel]];
      newData.forEach((data) => {
        newDataTable.push([data.name, data.value]);
      });
    }
    return newDataTable;
  }
}
