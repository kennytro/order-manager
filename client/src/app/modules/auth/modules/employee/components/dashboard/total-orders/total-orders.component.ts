import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { FormControl } from '@angular/forms';
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
    { label: 'Daily', unit: 'Date', format: 'Do', amountMetricName: 'total_sale_daily', countMetricName: 'total_orders_daily' },
    { label: 'Monthly', unit: 'Month', format: 'MMM', amountMetricName: 'total_sale_monthly', countMetricName: 'total_orders_monthly' },
    { label: 'Yearly', unit: 'Year', format: 'YYYY', amountMetricName: 'total_sale_yearly', countMetricName: 'total_orders_yearly' }
  ];
  intervalSelection: FormControl;
  orderChart: GoogleChartInterface = {
    chartType: 'ComboChart',
    dataTable: [
      ['Date', 'Amount', 'Count'],
      ['1st', 0, 0]
    ],
    options: {
      title: 'Total Orders Over Time',
      min: 0,
      vAxes: {
        0: { title: 'Amount', format:'$#,###.##' },
        1: { title: '# or Orders'}
      },
      series: {
        0: {
          type: 'bars',
          targetAxisIndex: 0
        },
        1: {
          type: 'line',
          targetAxisIndex: 1
        }
      }
    }
  };
  private _orderMetricDataArray = [];
  private _unsubscribe = new Subject<boolean>();

  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
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
    this._dataApi.genericMethod('Metric', 'findMetricDataByName', [[metricInfo.amountMetricName, metricInfo.countMetricName], null])
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

    const grouped = groupBy(dataArray, 'metricDate');
    let dateKeys = keys(grouped);
    dateKeys.sort();

    // build data table.
    this.orderChart.dataTable = [[intervalInfo.unit, 'Total Amount', 'Order Count']];  // header
    dateKeys.forEach((dateKey) => {
      let dataArray = grouped[dateKey];
      const hAxis = moment(dateKey).format(intervalInfo.format);
      const amount = dataArray.find(function(element) {
        return element.metricId === intervalInfo.amountMetricName;
      })
      const count = dataArray.find(function(element) {
        return element.metricId === intervalInfo.countMetricName;
      })
      this.orderChart.dataTable.push([hAxis, Number(amount.value), Number(count.value)]);
    })
    if (ccWrapper) {
      ccWrapper.draw();  // redraw chart
    }
  }
}
