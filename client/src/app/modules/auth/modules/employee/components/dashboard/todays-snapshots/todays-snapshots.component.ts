import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { Subject } from 'rxjs';
import { take, takeUntil, debounceTime } from 'rxjs/operators';
import * as moment from 'moment';

import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';

import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

@Component({
  selector: 'app-todays-snapshots',
  providers: [ SocketService ],
  templateUrl: './todays-snapshots.component.html',
  styleUrls: ['./todays-snapshots.component.css']
})
export class TodaysSnapshotsComponent implements OnInit {
  showSpinner = false;
  private _orders: Array<OrderSummary> = [];
  private _unsubscribe = new Subject<boolean>();  
  pieChart: GoogleChartInterface;

  constructor(private _dataApi: DataApiService,
    private _socketService: SocketService) { }

  ngOnInit() {
    this.showSpinner = true;
    this._getOrders();
    this._socketService.initSocket('order');
    this._socketService.onModel('order')
      .pipe(takeUntil(this._unsubscribe), debounceTime(1000))
      .subscribe((data) => {
        console.log(`Received message (${JSON.stringify(data)})`);
        this._getOrders();
      });
 }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  onReadyChart() {
    console.log('today\'s snapshot chart is ready');
    this.showSpinner = false;
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

    // assign color to slices
    const statusColors = {
      'Submitted': 'orange',
      'Processed': 'brown',
      'Shipped': 'red',
      'Completed': 'green',
      'Cancelled': 'gray'
    };
    let slicesColor = {};
    newData.forEach((row, index) => slicesColor[index] = { color: statusColors[row[0]] });
    // update chart
    if (this.pieChart) {
      this.pieChart.dataTable = newDataTable;
      this.pieChart.options['slices'] = slicesColor;
      this.pieChart.component.draw();
    } else {
      this._initializePieChart(newDataTable, slicesColor);
    }
  }

  private _initializePieChart(dataTable, slicesColor) {
    this.pieChart = {
      chartType: 'PieChart',
      dataTable: dataTable,
      options: {
        title: 'Today\'s Orders',
        slices: slicesColor
      },
    };
  } 
}
