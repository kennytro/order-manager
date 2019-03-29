import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
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
  displayedColumns = ['id', 'name', 'description', 'category', 'unitPrice', 'quantity', 'subtotal'];
  orderItems: MatTableDataSource<OrderItem>;
  order: any;
  orderFG: FormGroup;
  products: any[];
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _location: Location,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    /***** Form initialization *****/
    this.orderFG = this._formBuilder.group({
      clientInfo: [''],
      orderItemQuantities: this._formBuilder.array([]),
      note: ['']
    });

    /***** Data initialization: order, client and product list *****/
    this._route.data.subscribe(routeData => {
      if (routeData['orderInfo']) {
        let orderInfo = routeData['orderInfo'];
        this.order = orderInfo.order;
        this.products = orderInfo.products;

        // NOTE: 'clientInfo' is read-only.
        this.orderFG.get('clientInfo').setValue(`${this.order.clientId} - ${this.order.client.name}`);
        this.orderFG.get('note').setValue(this.order.note);
        this.orderFG.get('note').valueChanges.subscribe(note => {
          this.order.note = note;
        });

        // build array of order item.
        let orderItems:OrderItem[] = [];
        let quantitiesControl = <FormArray>this.orderFG.get('orderItemQuantities');
        for (let oItem of this.order.orderItem) {
          let orderItem = this._createItem(oItem);
          orderItems.push(orderItem);
          quantitiesControl.push(orderItem.quantity);
        }
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

  async save() {
    try {
      // preprocess order items
      let newOrderItems = this.orderItems.data;
      newOrderItems = newOrderItems.filter(oi => oi.quantity.value > '0');
      let newOrderItems2 = newOrderItems.map(oi => {
        return {
          productId: oi.id,
          quantity: oi.quantity.value,
          unitPrice: oi.unitPrice
        };
      });
      let status = await this._dataApi.genericMethod('Order', 'updateOrder',
        [this.order, newOrderItems2]).toPromise();
      const snackBarRef = this._snackBar.open(`Order(id: ${this.order.id}) successfully updated`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._location.back();
    } catch (err) {
      console.log(`error: failed to update an order - ${err.message}`);
    }
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
      subtotal: orderItem.unitPrice * orderItem.quantity
    };
    // update subtotal of item and order
    oItem.quantity.valueChanges.subscribe(val => {
      oItem.subtotal = oItem.unitPrice * val;
      this._updateTotalAmount();
    });
    return oItem;
  }

  private _calculateFee(subtotal: number): number {
    let newFee = 0;
    if (this.order.client) {
      if (this.order.client.feeType == 'Fixed') {
        newFee = this.order.client.feeValue;
      }
      if (this.order.client.feeType == 'Rate') {
        newFee = subtotal * this.order.client.feeValue / 100.0;
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
