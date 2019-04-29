import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { Subject, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';

import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-todays-snapshots',
  templateUrl: './todays-snapshots.component.html',
  styleUrls: ['./todays-snapshots.component.css']
})
export class TodaysSnapshotsComponent implements OnInit {
  private _orders: Array<OrderSummary> = [];
  private _unsubscribe = new Subject<boolean>();
  pieChart: GoogleChartInterface = {
    chartType: 'PieChart',
    dataTable: [
      ['Status', 'Count'],
      ['Submitted', 0],
      ['Processed', 0],
      ['Shipped', 0],
      ['Completed', 0],
      ['Cancelled', 0]
    ],
    options: {'title': 'Today\'s Orders'},
  };
  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
    timer(100, 60000)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        this._getOrders();
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  getOrderCount() {
    return this._orders.length;
  }

  getOrderAmount() {
    return this._orders.reduce((sum, order) => {
      return order.status === 'Cancelled' ? sum : sum + Number(order.totalAmount);
    }, 0);
  }

  private _getOrders() {
    this._dataApi.find('Order', { where: { createdAt: { gt: moment().startOf('day') } } })
      .pipe(take(1))
      .subscribe(orders => {
        this._orders = orders;
        this._updateChart();
      });
  }
  private _updateChart() {
    let ccComponent = this.pieChart.component;
    let ccWrapper = ccComponent.wrapper;    
    let grouped = groupBy(this._orders, 'status');
    let statuses = keys(grouped);
    let redrawFlag = false;
    statuses.forEach(status => {
      let dataElement = this.pieChart.dataTable.find(function(element) {
        return element[0] === status;
      });
      if (dataElement[1] !== grouped[status].length) {
        dataElement[1] = grouped[status].length;
        redrawFlag = true;
      }
    });

    //force a redraw
    if (redrawFlag && ccWrapper) {
      ccWrapper.draw();
    }
  }
}
