import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { DataApiService } from '../../../services/data-api.service';

import remove from 'lodash/remove';
import map from 'lodash/map';

@Component({
  selector: 'app-open-orders',
  templateUrl: './open-orders.component.html',
  styleUrls: ['./open-orders.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OpenOrdersComponent implements OnInit {
  displayedColumns: string[] = ['select', 'id', 'client', 'totalAmount', 'createdDate', 'note'];
  submittedOrders: MatTableDataSource<OrderSummary>;
  submittedOrderSelection: SelectionModel<OrderSummary>;
  processedOrders: MatTableDataSource<OrderSummary>;
  processedOrderSelection: SelectionModel<OrderSummary>;
  shippedOrders: MatTableDataSource<OrderSummary>;
  shippedOrderSelection: SelectionModel<OrderSummary>;

  constructor(private _route: ActivatedRoute) { }

  @ViewChild(MatSort) sortSubmitted: MatSort;
  @ViewChild(MatSort) sortProcessed: MatSort;
  @ViewChild(MatSort) sortShipped: MatSort;
  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orders']) {
        this._setTableDataSource(routeData['orders']);
      }
    });
  }

  isAllSubmittedSelected() {
    const numSelected = this.submittedOrderSelection.selected.length;
    const numRows = this.submittedOrders.data.length;
    return numSelected == numRows;
  }

  masterSubmittedToggle() {
    this.isAllSubmittedSelected() ?
      this.submittedOrderSelection.clear() :
      this.submittedOrders.data.forEach(row => this.submittedOrderSelection.select(row));
  }

  isAllProcessedSelected() {
    const numSelected = this.processedOrderSelection.selected.length;
    const numRows = this.processedOrders.data.length;
    return numSelected == numRows;
  }

  masterProcessedToggle() {
    this.isAllProcessedSelected() ?
      this.processedOrderSelection.clear() :
      this.processedOrders.data.forEach(row => this.processedOrderSelection.select(row));
  }

  isAllShippedSelected() {
    const numSelected = this.shippedOrderSelection.selected.length;
    const numRows = this.shippedOrders.data.length;
    return numSelected == numRows;
  }

  masterShippedToggle() {
    this.isAllShippedSelected() ?
      this.shippedOrderSelection.clear() :
      this.shippedOrders.data.forEach(row => this.shippedOrderSelection.select(row));
  }

  /*********  Submitted Order Functions **********/
  moveFromSubmittedToProcessed() {
    console.log('move selected order from submitted to processed');
  }

  cancelSelectedSubmitted() {
    console.log('cancel selected submitted orders');
  }

  showInventoryDialog() {
    console.log('show inventory dialog');
  }

  /*********  Processed Order Functions **********/
  moveFromProcessedToSubmitted() {
    console.log('move selected order from processed to submitted');
  }

  moveFromProcessedToShipped() {
    console.log('move selected order from processed to shipped');    
  }

  cancelSelectedProcessed() {
    console.log('cancel selected submitted orders');
  }

  showPackageDistributionDialog() {
    console.log('show package distribution dialog');
  }

  /*********  Shipped Order Functions **********/
  moveFromShippedToProcessed() {
    console.log('move selected order from shipped to processed');
  }

  moveFromShippedToCompleted() {
    console.log('move selected order from shipped to completed');    
  }

  cancelSelectedShipped() {
    console.log('cancel selected shipped orders');
  }

  private _setTableDataSource(orders: Array<any>) {
    orders = map(orders, order => {
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
    });
    let submits = remove(orders, { status: 'Submitted' });
    let processed = remove(orders, { status: 'Processed' });
    let shipped = orders;
    this.submittedOrders = new MatTableDataSource(submits);
    this.submittedOrders.sort = this.sortSubmitted;
    this.submittedOrderSelection = new SelectionModel<OrderSummary>(true, []);
    this.processedOrders = new MatTableDataSource(processed);
    this.processedOrders.sort = this.sortProcessed;
    this.processedOrderSelection = new SelectionModel<OrderSummary>(true, []);
    this.shippedOrders = new MatTableDataSource(shipped);
    this.shippedOrders.sort = this.sortShipped;
    this.shippedOrderSelection = new SelectionModel<OrderSummary>(true, []);
  }
}
