import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { FormControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import * as moment from 'moment';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-total-orders',
  templateUrl: './total-orders.component.html',
  styleUrls: ['./total-orders.component.css']
})
export class TotalOrdersComponent implements OnInit {
  intervalList = [
    { label: 'Daily', unit: 'Date', format: 'Do', amountMetricName: 'client_sale_daily' },
    { label: 'Monthly', unit: 'Month', format: 'MMM', amountMetricName: 'client_sale_monthly' },
    { label: 'Yearly', unit: 'Year', format: 'YYYY', amountMetricName: 'client_sale_yearly' }
  ];
  intervalSelection: FormControl;
  orderChart: GoogleChartInterface;
  clientId = '';
  private _orderMetricDataArray = [];
  private _unsubscribe = new Subject<boolean>();

  constructor(private _cookieService: CookieService, private _dataApi: DataApiService) { }

  ngOnInit() {
    this.clientId = this._cookieService.get('clientId');
    this.intervalSelection = new FormControl('Daily');
    this.intervalSelection.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(label => {
        this._getMetricData(label);
      });

    this._getMetricData('Daily');
    // [HACK]: For some reason, chart format doesn't work first time.
    // To get around this problem, force redraw after 1 sec.
    setTimeout(() => {
      this._getMetricData('Daily');
    }, 1000);
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }
  private _getMetricData(intervalLabel) {
    let metricInfo = this.intervalList.find(element => element.label === intervalLabel);
    this._dataApi.genericMethod('Metric', 'findMetricDataByName', [[metricInfo.amountMetricName], { groupByValue: this.clientId }])
      .pipe(take(1))
      .subscribe(data => {
        this._updateChart(data, intervalLabel);
      });
  }

  private _updateChart(dataArray, intervalLabel) {
    const intervalInfo = this.intervalList.find(function(element) {
      return element.label === intervalLabel;
    })
    // build data table.
    let tableHeader = [[intervalInfo.unit, 'Total Amount']];
    let newData = dataArray.map((element) => {
      return [moment(element.metricDate).format(intervalInfo.format), Number(element.value)];
    });
    let newDataTable = tableHeader.concat(newData);
    // update chart
    if (this.orderChart) { 
      this.orderChart.dataTable = newDataTable;
      this.orderChart.component.draw();  // redraw chart
    } else {
      this._initializeOrderChart(newDataTable);
    }
  }

  private _initializeOrderChart(dataTable) {
    this.orderChart = {
      chartType: 'Bar',
      dataTable: dataTable,
      options: {
        min: 0,
        vAxes: { 0: { format: '$#,###.##' } }
      }
    };
  }  
}