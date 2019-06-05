import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FileService } from '../../../../../shared/services/file.service';
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
  displayedColumns = ['id', 'name', 'description', 'category', 'quantity', 'unitPrice', 'subtotal'];
  orderItems: MatTableDataSource<OrderItem>;
  order: any;
  orderFG: FormGroup;
  products: any[];
  private _unsubscribe = new Subject<boolean>();  

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _location: Location,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fs: FileService,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    /***** Form initialization *****/
    this.orderFG = this._formBuilder.group({
      orderItemQuantities: this._formBuilder.array([]),
      note: ['']
    });

    /***** Data initialization: order, client and product list *****/
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['orderInfo']) {
          let orderInfo = routeData['orderInfo'];
          this._setOrderObject(orderInfo.order);
          this.products = orderInfo.products;

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

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }  

  explainFee(): string {
    let text = '';
    if (this.order.client) {
      if (this.order.client.feeType == 'Fixed') {
        text = 'Fixed amount';
      }
      if (this.order.client.feeType == 'Rate') {
        text = `$${this.order.subtotal.toFixed(2)} x ${this.order.client.feeValue}(%) = ${this.order.fee.toFixed(2)}`;
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

  downloadPdf() {
    this._dataApi.genericMethod('Order', 'getOrderInvoicePdfUrl', [this.order.id])
      .pipe(take(1))    // maybe not necessary?
      .subscribe(url => {
        console.debug(`file url: ${url}`);
        this._fs.downloadPDF(url)
          .subscribe(res => {
            console.debug('download is done.');
            const element = document.createElement('a');
            element.href = URL.createObjectURL(res);
            element.download =  `order_invoice_${this.order.id}.pdf`;
            // Firefox requires the element to be in the body
            document.body.appendChild(element);
            //simulate click
            element.click();
            //remove the element when done
            document.body.removeChild(element);
          });
      });
  }

  close() {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this._router.navigate(['../'], { relativeTo: this._route });  // navigate to '/orders/'
    }
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
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(async result => {
        if (result) {
          await this._dataApi.genericMethod('Order', 'cancelOrder', [this.order]).toPromise();
          const snackBarRef = this._snackBar.open(`Successfully cancelled the order(id: ${this.order.id}) `, 'Close', {
            duration: 3000
          });
          snackBarRef.onAction()
            .pipe(take(1))
            .subscribe(() => {
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
      this.order.note = this.orderFG.get('note').value;
      let status = await this._dataApi.genericMethod('Order', 'updateOrder',
        [this.order, newOrderItems2]).toPromise();
      const snackBarRef = this._snackBar.open(`Order(id: ${this.order.id}) successfully updated`,
        'Close', { duration: 3000 });
      snackBarRef.onAction()
        .pipe(take(1))
        .subscribe(() => {
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
    oItem.quantity.valueChanges
      .pipe(takeUntil(this._unsubscribe))    
      .subscribe(val => {
        oItem.subtotal = oItem.unitPrice * val;
        this._updateTotalAmount();
      });
    return oItem;
  }

  private _calculateFee(subtotal: number): number {
    let newFee = 0;
    if (this.order.client) {
      if (this.order.client.feeType == 'Fixed') {
        newFee = Number(this.order.client.feeValue);
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

  /*
   * Because Postgres converts Numeric value to string, we need to convert it back.
   */
  private _setOrderObject(orderObject) {
    this.order = orderObject;
    this.order.subtotal = Number(this.order.subtotal);
    this.order.fee = Number(this.order.fee);
    this.order.totalAmount = Number(this.order.totalAmount);

    this.orderFG.get('note').setValue(this.order.note);
  }
}
