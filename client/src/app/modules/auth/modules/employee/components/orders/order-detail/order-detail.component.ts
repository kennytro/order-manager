import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataApiService } from '../../../services/data-api.service';

import get from 'lodash/get';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  displayedColumns = ['id', 'name', 'description', 'category', 'unitPrice', 'quantity', 'subTotal'];
  orderItems: MatTableDataSource<OrderItem>;
  order: any;
  products: any[];
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['orderInfo']) {
        let orderInfo = routeData['orderInfo'];
        this.order = orderInfo.order;
        this.products = orderInfo.products;
        // this._userCreated = this.order.userCreated;
        // this._userUpdated = this.order.userUpdated;
        // this._client = this.order.client;
        
        // build array of order item.
        let orderItems = map(this.order.orderItem, oi => this._createItem(oi));
        orderItems = sortBy(orderItems, ['category', 'name']);
        this.orderItems = new MatTableDataSource(orderItems);
      }
    });
  }

  explainFee(): string {
    let text = '';
    if (this.order.client) {
      if (this.order.client.feeType == 'Fixed') {
        text = 'Fixed amount';
      }
      if (this.order.client.feeType == 'Rate') {
        text = `$${this.order.subtotal} x ${this.order.client.feeValue}(%) = ${this.order.fee}`;
      }
    }
    return text;
  }

  getEmailCreated() {
    return this.order.userCreated.email;
  }

  getEmailUpdated() {
    return this.order.userUpdated ? this.order.userUpdated.email : null;
  }

  close() {
    this._location.back();
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

  save() {
    console.log('clicked save');
    this._location.back();
  }

  private _createItem(orderItem): OrderItem {
    const product = this.products.find(p => p.id === orderItem.productId);
    let oItem: OrderItem = {
      id: orderItem.productId,
      imageUrl: get(product, ['settings', 'imageUrl']),
      name: get(product, ['name']),
      description: get(product, ['description']),
      category: get(product, ['category']),
      unitPrice: orderItem.unitPrice,
      unit: get(product, ['unit']),
      quantity: new FormControl(orderItem.quantity),
      subTotal: orderItem.unitPrice * orderItem.quantity
    };
    // update subtotal of item and order
    oItem.quantity.valueChanges.subscribe(val => {
      oItem.subTotal = oItem.unitPrice * val;
      this._updateTotalAmount();
    });
    return oItem;
  }

  private _calculateFee(subTotal: number): number {
    let newFee = 0;
    if (this.order.client) {
      if (this.order.client.feeType == 'Fixed') {
        newFee = this.order.client.feeValue;
      }
      if (this.order.client.feeType == 'Rate') {
        newFee = subTotal * this.order.client.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _updateTotalAmount() {
    let newSubtotal = 0;
    for (let element of this.orderItems.data) {
      newSubtotal += Number(element.subTotal);
    }
    this.order.subtotal = newSubtotal;
    this.order.fee = this._calculateFee(newSubtotal);
    this.order.totalAmount = this.order.subtotal + this.order.fee;
  }
}
