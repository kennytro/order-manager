import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTableDataSource, MatSnackBar /* , MatStepper*/ } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ConfirmDialogComponent, DialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataApiService } from '../../services/data-api.service';

import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  displayedColumns = ['id', 'name', 'description', 'category', 'unitPrice', 'quantity', 'subtotal'];
  orderItems: MatTableDataSource<any>;
  order: any;
  orderFC: FormControl;  // Unused but just to address stepper icon bug. 
  private _userCreated: any;
  private _userUpdated: any;
  private _client: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) {
    this.orderFC = new FormControl(true);
  }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orderInfo']) {
        let orderInfo = routeData['orderInfo'];
        this.order = orderInfo.order;
        this._userCreated = this.order.userCreated;
        this._userUpdated = this.order.userUpdated;
        this._client = this.order.client;

        let existingOrderItems = this.order.orderItem;
        let products = orderInfo.products;
        let productExclusionList = orderInfo.productExclusionList;

        // build array of order item.
        let orderItems = new Array() as Array<OrderItem>;
        for (let product of sortBy(products, ['category', 'name'])) {
          // include existing order item
          let orderItem = existingOrderItems.find((oi) => oi.productId == product.id);
          if (orderItem) {
            orderItems.push(this._createItem(product, orderItem));
          } else {
            // add additional item if order can be changed and
            // item is not in exclusion list.
            if (this.order.status == 'Submitted' &&
                !productExclusionList.includes(product.id)) {
              orderItems.push(this._createItem(product));
            }
          }
        }
        this.orderItems = new MatTableDataSource(orderItems);
      }
    });
  }

  getReviewItemTableSource() {
    const rows = this.orderItems.data;
    return new MatTableDataSource(rows.filter(row => row.quantity.value > '0'));
  }

  explainFee(): string {
    let text = '';
    if (this._client) {
      if (this._client.feeType == 'Fixed') {
        text = 'Fixed amount';
      }
      if (this._client.feeType == 'Rate') {
        text = `$${this.order.subtotal} x ${this._client.feeValue}(%) = ${this.order.fee}`;
      }
    }
    return text;
  }

  getEmailCreated() {
    return this._userCreated.email;
  }

  getEmailUpdated() {
    return this._userUpdated ? this._userUpdated.email : null;
  }

  async cancelOrder() {
    const dialogData: DialogData = {
      title: `Do you want to cancel this order(id: ${this.order.id})`,
      confirmColor: 'warn',
      confirmIcon: 'trash-alt',
      confirmLabel: 'Cancel order'
    };
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this._dataApi.genericMethod('Order', 'cancelOrder', [this.order]).toPromise();
        const snackBarRef = this._snackBar.open(`Successfully cancelled the order(id: ${this.order.id}) `, 'Close', {
          duration: 3000
        });
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
        this._router.navigate(['../'], { relativeTo: this._route });
      }
    })    
  }

  async save() {
    try {
      // preprocess order items
      let newOrderItems = this.orderItems.data;
      newOrderItems = newOrderItems.filter(oi => oi.quantity.value > '0');
      newOrderItems = newOrderItems.map(oi => {
        return {
          productId: oi.id,
          quantity: oi.quantity.value,
          unitPrice: oi.unitPrice
        };
      });
      let status = await this._dataApi.genericMethod('Order', 'updateOrder',
        [this.order, newOrderItems]).toPromise();
      const snackBarRef = this._snackBar.open(`Order(id: ${this.order.id}) successfully updated`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._router.navigate(['../'], { relativeTo: this._route});
    } catch (err) {
      console.log(`error: failed to update an order - ${err.message}`);
    }
  }

  private _createItem(product, orderItem?): OrderItem {
    let oItem = {
      id: product.id,
      imageUrl: get(product, ['settings', 'imageUrl']),
      name: product.name,
      description: product.description,
      category: product.category,
      unitPrice: product.unitPrice,
      unit: product.unit,
      quantity: new FormControl('0'),
      subtotal: 0
    }
    // override with order item
    if (orderItem) {
      oItem.unitPrice = orderItem.unitPrice;
      oItem.quantity.setValue(orderItem.quantity);
      oItem.subtotal = orderItem.unitPrice * orderItem.quantity;
    }
    // update subtotal of item and order
    oItem.quantity.valueChanges.subscribe(val => {
      oItem.subtotal = oItem.unitPrice * val;
      this._updateTotalAmount();
    });
    return oItem;
  }

  private _calculateFee(subtotal: number): number {
    let newFee = 0;
    if (this._client) {
      if (this._client.feeType == 'Fixed') {
        newFee = this._client.feeValue;
      }
      if (this._client.feeType == 'Rate') {
        newFee = subtotal * this._client.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _updateTotalAmount() {
    let newSubtotal = 0;
    for (let element of this.orderItems.data) {
      newSubtotal += Number(element.subtotal);
    }
    this.order.subtotal = newSubtotal;
    this.order.fee = this._calculateFee(newSubtotal);
    this.order.totalAmount = this.order.subtotal + this.order.fee;
  }
}
