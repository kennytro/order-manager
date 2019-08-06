import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-history-graph[metricName]',
  templateUrl: './history-graph.component.html',
  styleUrls: ['./history-graph.component.css']
})
export class HistoryGraphComponent implements OnInit {
  ranges = [
    { label: '30 Days', cutOffDate: moment().subtract(30, 'days').toDate() },
    { label: '90 Days', cutOffDate: moment().subtract(90, 'days').toDate() },
    { label: '1 Year', cutOffDate: moment().subtract(1, 'years').toDate() },
    { label: '3 Year', cutOffDate: moment().subtract(1, 'years').toDate() }
  ];
  rangeSelection: FormControl;

  historyChart: GoogleChartInterface;
//  showSpinner = false;
  private _unsubscribe = new Subject<boolean>();

  private _cutOffDate: Date;
  private _instanceId: string;
  @Input()
  set instanceId(id: string) {
    if (this._instanceId !== id) {
      this._instanceId = id;
      this._updateChart();
    }
  }
  get instanceId(): string { return this._instanceId; }


  @Input() metricName: string;
  private _metricDefinition: any;

  @Input() chartType: string = 'LineChart';

  constructor(private _dataApi: DataApiService) {
    this._cutOffDate = this.ranges[0].cutOffDate;
  }

  ngOnInit() {
    this.rangeSelection = new FormControl(this.ranges[0].label);
    this.rangeSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(rangeLabel => {
        let rangeInfo = this.ranges.find(element => element.label === rangeLabel);
        if (this._cutOffDate !== rangeInfo.cutOffDate) {
          this._cutOffDate = rangeInfo.cutOffDate;
          this._updateChart();
        }
      });

    this._dataApi.genericMethod('Metric', 'findOne', [{ where: { name: this.metricName } }])
      .pipe(take(1))
      .subscribe(metric => {
        if (metric) {
          this._metricDefinition = metric;
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  private _updateChart() {
    if (this._instanceId) {
//      this.showSpinner = true;
      this._dataApi.genericMethod('Metric', 'findMetricDataByName',
        [[this._metricDefinition.name],
        { instanceId: this._instanceId, metricDate: { gt: this._cutOffDate } }])
        .pipe(take(1))
        .subscribe(data => {
          let newDataTable = this._getDataTableFromMetricData(data);
//          this.showSpinner = false;
          if (this.historyChart) {
            this.historyChart.dataTable = newDataTable;
            this.historyChart.component.draw();
          } else {
            this._initializeChart(this._metricDefinition, newDataTable);
          }
        });
    }
  }

  private _initializeChart(metric, dataTable) {
    let colorName = this._getColorName(metric.modelName);
    this.historyChart = {
      chartType: this.chartType,
      dataTable: dataTable,
      options: {
        colors: [colorName],
        chartArea: { top: 20, left: 50 },
        title: metric.displayName,
        width: 600,
        height: 300,
        legend: 'none',
        vAxis: { title: '', format: (metric.unit === 'Currency') ? '$#' : undefined },
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        }
      }
    };
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

  /**
   * Make a chart data table using metric data.
   * @params{Object[]} metricData
   * @returns{Object[]} chart data table
   */
  private _getDataTableFromMetricData(metricData: any[]) :any[] {    
    if (metricData.length === 0) {
      return [['', {role: 'annotation'}], ['', '']];
    }
    let newDataTable = [];
    newDataTable = [['Date', this._metricDefinition.unitLabel]];
    metricData.sort(function(a, b) { 
      return moment(a.metricDate).isBefore(b.metricDate) ? -1 : 1;
    });
    metricData.forEach((data) => {
      newDataTable.push([moment(data.metricDate).format('MM/DD/YY'), Number(data.value)]);
    });
    
    return newDataTable;
  }  
}
