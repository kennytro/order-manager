import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { FormControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Subject, timer } from 'rxjs';
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
  orderChart: GoogleChartInterface = {
    chartType: 'Bar',
    dataTable: [
      ['Date', 'Amount'],
      ['1st', 0]
    ],
    options: {
      // title: 'Total Orders Over Time',
      min: 0,
      vAxes: { 0: { format: '$#,###.##' } }
    }
  };
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
    timer(100)
      .pipe(take(1))
      .subscribe(()=> {
        this._getMetricData('Daily');
      });
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
    let ccComponent = this.orderChart.component;
    let ccWrapper = ccComponent.wrapper;     
    const intervalInfo = this.intervalList.find(function(element) {
      return element.label === intervalLabel;
    })
    this.orderChart.dataTable = [[intervalInfo.unit, 'Total Amount']];  // header
    dataArray.forEach((element) => {
      this.orderChart.dataTable.push([moment(element.metricDate).format(intervalInfo.format), Number(element.value)]);
    });
    if (ccWrapper) {
      ccWrapper.draw();  // redraw chart
    }
  }
}
