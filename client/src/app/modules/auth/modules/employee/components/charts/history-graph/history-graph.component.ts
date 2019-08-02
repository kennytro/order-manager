import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { take } from 'rxjs/operators';
import * as moment from 'moment';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-history-graph[metricName]',
  templateUrl: './history-graph.component.html',
  styleUrls: ['./history-graph.component.css']
})
export class HistoryGraphComponent implements OnInit {
  historyChart: GoogleChartInterface;
//  showSpinner = false;
  private _instanceId: string;
  @Input()
  set instanceId(id: string) {
    if (this._instanceId !== id) {
      this._instanceId = id;
      this._updateChart(id);
    }
  }
  get instanceId(): string { return this._instanceId; }


  @Input() metricName: string;
  private _metricDefinition: any;

  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
    this._dataApi.genericMethod('Metric', 'findOne', [{ where: { name: this.metricName } }])
      .pipe(take(1))
      .subscribe(metric => {
        if (metric) {
          this._metricDefinition = metric;
          this._initializeChart(metric);
        }
      });
  }

  private _updateChart(instanceId: string) {
    if (instanceId) {
//      this.showSpinner = true;
      this._dataApi.genericMethod('Metric', 'findMetricDataByName', [[this._metricDefinition.name],  { instanceId: instanceId }])
        .pipe(take(1))
        .subscribe(data => {
          if (data.length === 0) {
            this.historyChart.dataTable = [['', {role: 'annotation'}], ['', '']];
          } else {
            this.historyChart.dataTable = [['Date', this._metricDefinition.unitLabel]];
            data.sort(function(a, b) { 
              return moment(a.metricDate).isBefore(b.metricDate) ? -1 : 1;
            });
            data.forEach((data) => {
              return this.historyChart.dataTable.push([moment(data.metricDate).format('MM/DD/YY'), Number(data.value)]);
            });
          }
//          this.showSpinner = false;
          this.historyChart.component.draw();
        });
    }
  }

  private _initializeChart(metric) {
    this.historyChart = {
      chartType: 'LineChart',
      dataTable: [['', {role: 'annotation'}], ['', '']],
      options: {
        title: metric.displayName,
        width: 600,
        height: 400,
        legend: 'none',
        vAxis: { title: metric.unitLabel }
      }
    };
  }
}
