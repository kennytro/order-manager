import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { take } from 'rxjs/operators';
import * as moment from 'moment';

import { DataApiService } from '../../../../services/data-api.service';

@Component({
  selector: 'app-user-logs',
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.css']
})
export class UserLogsComponent implements OnInit {
  logTable: GoogleChartInterface;
  private _authId: string;
  @Input()
  set authId(id: string) {
    if (this._authId !== id) {
      this._authId = id;
      this._updateChart();
    }
  }
  get authId(): string { return this._authId; }

  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
  }

  private _updateChart() {
    if (this._authId) {
      this._dataApi.genericMethod('EndUser', 'getAuth0Logs', [this._authId])
        .pipe(take(1))
        .subscribe(data => {
          let newDataTable = this._getDataTableFromLogs(data);
          if (this.logTable) {
            this.logTable.dataTable = newDataTable;
            this.logTable.component.draw();
          } else {
            this._initializeChart(newDataTable);
          }
        });
    }
  }

  private _initializeChart(dataTable) {
    this.logTable = {
      chartType: 'Table',
      dataTable: dataTable,
      options: { width: '100%', allowHtml: true}
    };
  }

  /**
   * Make a chart data table using metric data.
   * @params{Object[]} metricData
   * @returns{Object[]} chart data table
   */
  private _getDataTableFromLogs(logs: any[]) :any[] {    
    let newDataTable = [];
    if (logs.length > 0) {
      newDataTable = [['Date', 'Type', 'Description', 'From']];
      logs.sort(function(a, b) { 
        return moment(a.date).isAfter(b.date) ? -1 : 1;
      });
      logs.forEach((data) => {
        newDataTable.push([moment(data.date).fromNow(), data.type, data.description, data.from]);
      });
    }    
    return newDataTable;
  }  
}
