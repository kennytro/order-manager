import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import map from 'lodash/map';

@Component({
  selector: 'app-todays-orders',
  templateUrl: './todays-orders.component.html',
  styleUrls: ['./todays-orders.component.css']
})
export class TodaysOrdersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'status', 'client', 'totalAmount', 'createdDate', 'note'];
  orders: MatTableDataSource<OrderSummary>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orders']) {
        this._setTableDataSource(routeData['orders']);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.orders.filter = filterValue.trim().toLowerCase();

    if (this.orders.paginator) {
      this.orders.paginator.firstPage();
    }
  }

  private _setTableDataSource(orders: Array<any>) {
    this.orders = new MatTableDataSource(map(orders, order => {
      let client = order.client;
      return {
        id: order.id,
        clientId: client.id,
        clientName: client.name,
        status: order.status,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        note: order.note
      };
    }));
    this.orders.paginator = this.paginator;
    this.orders.sort = this.sort;   
  } 
}
