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
  ranges = [
    { label: '30 Days', cutOffDate: moment().subtract(30, 'days').toDate() },
    { label: '60 Days', cutOffDate: moment().subtract(60, 'days').toDate() },
    { label: '90 Days', cutOffDate: moment().subtract(90, 'days').toDate() }    
  ];
  rangeSelection: FormControl;
  rankChart: GoogleChartInterface;

  private _unsubscribe = new Subject<boolean>();
  private _instanceMap = new Map();

  @Input() metricName: string;
  private _metricDefinition: any;

  @Input() limit = 10;
  @Input() chartTitle: string;
  @Input() chartType: string = 'BarChart';

  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
    this.rangeSelection = new FormControl('30 Days');
    this.rangeSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(rangeLabel => {
        this._updateChart(rangeLabel);
      });

    this._dataApi.genericMethod('Metric', 'findOne', [{ where: { name: this.metricName } }])
      .pipe(take(1))
      .subscribe(metric => {
        if (metric) {
          this._metricDefinition = metric;
          if (!this.chartTitle) {
            this.chartTitle = metric.displayName;
          }
          this._initializeChart(metric, [['', {role: 'annotation'}], ['', '']]);
          this._setInstanceMap(metric)
          .subscribe(instanceCount => {
            this._updateChart('30 Days');
          });
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  private _initializeChart(metric, dataTable) {
    let colorName = this._getColorName(metric.modelName);
    this.rankChart = {
      chartType: this.chartType,
      dataTable: dataTable,
      options: {
        // title: this.chartTitle,
        // width: 400,
        colors: [colorName],
        chartArea: { top: 10 },
        height: 400,
        legend: { position: 'none' },
        vAxis: { title: metric.modelName, textPosition: 'in' },
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

  private _updateChart(intervalLabel) {
    let rangeInfo = this.ranges.find(element => element.label === intervalLabel);
    this._dataApi.genericMethod('Metric', 'findMetricDataByName',
      [[this._metricDefinition.name],
      { metricDate: { gt: rangeInfo.cutOffDate } }])
      .pipe(take(1))
      .subscribe(data => {
        let grouped = groupBy(data, 'instanceId');
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
        newData.splice(this.limit);
        let newDataTable = [];
        if (newData.length === 0) {
          newDataTable = [['', {role: 'annotation'}], ['', '']];
        } else {
          newDataTable = [[this._metricDefinition.modelName, this._metricDefinition.unitLabel]];
          newData.forEach((data) => {
            newDataTable.push([data.name, data.value]);
          });

        }
        //this.showSpinner = false;
        // HACK: delay draw() to give time for Google chart to initialize.
        setTimeout(() => {
          this.rankChart.dataTable = newDataTable;
          this.rankChart.component.draw();          
        }, 400);
      });
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

}
