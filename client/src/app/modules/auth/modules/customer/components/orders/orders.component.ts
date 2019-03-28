import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataApiService } from '../../services/data-api.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // TO DO: get column names from service.
  displayedColumns: string[] = ['id', 'status', 'totalAmount', 'createdDate', 'lastUpdatedDate', 'note'];
  private _orders: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _route: ActivatedRoute,
    private _dataApi: DataApiService) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orders']) {
        this._setTableDataSource(routeData['orders']);
      }
    });
  }

  applyFilter(filterValue: string) {
    this._orders.filter = filterValue.trim().toLowerCase();

    if (this._orders.paginator) {
      this._orders.paginator.firstPage();
    }
  }

  getOrders() {
    return this._orders;
  }

  addOrder() {
    console.log('TO DO: add order dialog');
  }

  private _setTableDataSource(orders: Array<any>) {
    this._orders = new MatTableDataSource(orders);
    this._orders.paginator = this.paginator;
    this._orders.sort = this.sort;   
  }  
}
