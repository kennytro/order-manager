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
  pieChart: GoogleChartInterface;

  constructor(private _dataApi: DataApiService) { }

  ngOnInit() {
    timer(10, 60000)  // refresh chart every minute.
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
    let grouped = groupBy(this._orders, 'status');
    let statuses = keys(grouped);
    // build data table.    
    let tableHeader = [['Status', 'Count']];
    let newData = statuses.map(status => [status, grouped[status].length]);
    let newDataTable = tableHeader.concat(newData);    
    // update chart
    if (this.pieChart) {
      this.pieChart.dataTable = newDataTable;
      this.pieChart.component.draw();
    } else {
      this._initializePieChart(newDataTable);
    }
  }

  private _initializePieChart(dataTable) {
    this.pieChart = {
      chartType: 'PieChart',
      dataTable: dataTable,
      options: {'title': 'Today\'s Orders'},
    };
  }   
}
