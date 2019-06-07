import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { take } from 'rxjs/operators';

import { PackageDistributionComponent } from './package-distribution/package-distribution.component';
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

  @ViewChild(MatSort) sortSubmitted: MatSort;
  @ViewChild(MatSort) sortProcessed: MatSort;
  @ViewChild(MatSort) sortShipped: MatSort;

  constructor(
    private _route: ActivatedRoute,
    private _packageDistributionDialog: MatDialog,
    private _snackBar: MatSnackBar,    
    private _dataApi: DataApiService
) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orders']) {
        this._setTableDataSource(routeData['orders'], ['Submitted', 'Processed', 'Shipped']);
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
  async moveFromSubmittedToProcessed() {
    let orderIds = this.submittedOrderSelection.selected.map(selected => selected.id);
    if (orderIds.length > 0) {
      this._updateOrderStatus(orderIds, 'Submitted', 'Processed');
    }
  }

  /*********  Processed Order Functions **********/
  moveFromProcessedToSubmitted() {
    let orderIds = this.processedOrderSelection.selected.map(selected => selected.id);
    if (orderIds.length > 0) {
      this._updateOrderStatus(orderIds, 'Processed', 'Submitted');
    }
  }

  moveFromProcessedToShipped() {
    let orderIds = this.processedOrderSelection.selected.map(selected => selected.id);
    if (orderIds.length > 0) {
      this._updateOrderStatus(orderIds, 'Processed', 'Shipped');
    }
  }

  // showPackageDistributionDialog() {
  //   if (this.processedOrders.data.length === 0) {
  //     const snackBarRef = this._snackBar.open('There is no order processed.', 'Close');
  //     snackBarRef.onAction()
  //       .pipe(take(1))
  //       .subscribe(() => {
  //         snackBarRef.dismiss();
  //       });
  //     return;      
  //   }

  //   const dialogData: PackageDistributionDialogData = {
  //     orderIds: this.processedOrders.data.map(function(order) {
  //       return order.id
  //     })
  //   };
  //   const dialogRef = this._packageDistributionDialog.open(PackageDistributionComponent, {
  //     data: dialogData
  //   });
  // }

  /*********  Shipped Order Functions **********/
  moveFromShippedToProcessed() {
    let orderIds = this.shippedOrderSelection.selected.map(selected => selected.id);
    if (orderIds.length > 0) {
      this._updateOrderStatus(orderIds, 'Shipped', 'Processed');
    }
  }

  moveFromShippedToCompleted() {
    let orderIds = this.shippedOrderSelection.selected.map(selected => selected.id);
    if (orderIds.length > 0) {
      this._updateOrderStatus(orderIds, 'Shipped', 'Completed');
    }
  }

  /*
   * Bulk update order status. Afterward, also update order tables that have changed.
   * @params {String[]} - order Ids
   * @param {String} - from status.
   * @param {String} - to status,
   */
  private async _updateOrderStatus(orderIds: Array<string>, fromStatus: string, toStatus: string) {
    if (orderIds.length > 0) {
      try {
        // update order status
        await this._dataApi.genericMethod('Order', 'updateAll', [{ id: { inq: orderIds } },
          { status: toStatus }]).toPromise();
        // query orders to update affected tables.
        let orders = await this._dataApi.find('Order', {
          where: { status: { inq: [fromStatus, toStatus] } },
          include: [{
            relation: 'client',
            scope: { fields: { id: true, name: true }}
          }]
         }).toPromise();
        this._setTableDataSource(orders, [fromStatus, toStatus]);
      } catch (err) {
        console.log(`error: failed to change order status - ${err.message}`);
      }
    }
  }

  private _setTableDataSource(orders: Array<any>, statuses: Array<string> ) {
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

    if (statuses.includes('Submitted')) {
      let submits = remove(orders, { status: 'Submitted' });
      this.submittedOrders = new MatTableDataSource(submits);
      this.submittedOrders.sort = this.sortSubmitted;
      this.submittedOrderSelection = new SelectionModel<OrderSummary>(true, []);
    }

    if (statuses.includes('Processed')) {
      let processed = remove(orders, { status: 'Processed' });
      this.processedOrders = new MatTableDataSource(processed);
      this.processedOrders.sort = this.sortProcessed;
      this.processedOrderSelection = new SelectionModel<OrderSummary>(true, []);
    }

    if (statuses.includes('Shipped')) {
      let shipped = remove(orders, { status: 'Shipped' });
      this.shippedOrders = new MatTableDataSource(shipped);
      this.shippedOrders.sort = this.sortShipped;
      this.shippedOrderSelection = new SelectionModel<OrderSummary>(true, []);
    }
  }
}
