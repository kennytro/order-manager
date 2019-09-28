import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource, MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import * as moment from 'moment';

import { RootScopeShareService } from '../../../../../../../services/root-scope-share.service';
import { DataApiService } from '../../../services/data-api.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  static readonly defaultColumns = ['id', 'name', 'description', 'category', 'quantity', 'unitPrice', 'subtotal'];
  static readonly noPriceColumns = ['id', 'name', 'description', 'category', 'quantity', 'unit'];
  displayedColumns: Array<string>;
  orderItems: MatTableDataSource<OrderItem>;
  order: any;
  orderFG: FormGroup;
  hidePrice: boolean;
  private _unsubscribe = new Subject<boolean>();
  private _endUser: any;
  private _client: any;
  // disabling sort because it doesn't work with form group in row
//  @ViewChild(MatSort) sort: MatSort;
  /* First row in order item table that should set selected initially */ 
  @ViewChild('firstItem') firstItem: ElementRef;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _dataShare: RootScopeShareService
  ) { 
    this.order = {
      clientId: '',
      subtotal: 0,
      fee: 0,
      feeExplanation: '',
      totalAmount: 0,
      note: null
    };
    this.hidePrice = false;
    this.displayedColumns = NewOrderComponent.defaultColumns;
  }

  ngOnInit() {
    /***** tenant configuration *****/
    const tenant = this._dataShare.getData('tenant');
    if (tenant && tenant.hidePriceFromCustomer) {
      // display different columns when price is hidden.
      this.hidePrice = true;
      this.displayedColumns = NewOrderComponent.noPriceColumns;
    }
    /***** Form initialization *****/
    this.orderFG = this._formBuilder.group({
      orderItemQuantities: this._formBuilder.array([]),
      note: ['']
    });
    /***** Data initialization: client and product list *****/
    this._dataApi.genericMethod('Client', 'getMyClient')
      .subscribe(result => {
        this._client = result;
        this.order.clientId = result.id;
      });
    this._route.data.subscribe(routeData => {
      if (routeData['endUser']) {
        this._endUser = routeData['endUser'];
      }
      if (routeData['products']) {
        let products = sortBy(routeData['products'], ['category', 'name']);
        if (this._endUser) {
          // remove products the user does not want.
          let excluded = get(this._endUser, ['userSettings', 'productExcluded'], []);
          if (excluded.length > 0) {
            products = products.filter(product => !excluded.includes(product.id));
          }
        }
        let orderItems:OrderItem[] = [];
        let quantitiesControl = <FormArray>this.orderFG.get('orderItemQuantities');
        for (let product of products) {
          let orderItem = this._createOrderItem(product);
          orderItems.push(orderItem);
          quantitiesControl.push(orderItem.quantity);
        }
        this._setTableDataSource(orderItems);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  getOrderItemTableSource() {
    if (this.orderItems) {
      const rows = this.orderItems.data;
      return new MatTableDataSource(rows.filter(row => row.quantity.value > 0));
    }
    return new MatTableDataSource([]);
  }

  /* Fee is applicable only if fee schedule is 'Order'.
   */ 
  isFeeApplicable(): boolean {
    return this._client && this._client.feeSchedule === 'Order';
  }

  cancel() {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this._router.navigate(['../'], { relativeTo: this._route });  // navigate to '/orders/'
    }
  }

  async create() {
    try {
      let orderItems = this.orderItems.data
        .filter(row => row.quantity.value > 0)
        .map(oi => {
          return {
            productId: oi.id,
            quantity: oi.quantity.value,
            unitPrice: oi.unitPrice
          };
      });
      this.order.note = this.orderFG.get('note').value;
      let status = await this._dataApi.genericMethod('Order', 'createNew', [this.order, orderItems]).toPromise();
      const snackBarRef = this._snackBar.open(`Order(id: ${status.orderId}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      if (window.history.length > 1) {
        this._location.back();
      } else {
        this._router.navigate(['../'], { relativeTo: this._route});
      }
    } catch (err) {
      console.log(`error: failed to create an order - ${err.message}`);      
    }
  }

  private _createOrderItem(product): OrderItem {
    let newOrderItem = {
      id: product.id,
      imageUrl: get(product, ['settings', 'imageUrl']),
      name: product.name,
      description: product.description,
      category: product.category,
      unitPrice: product.unitPrice,
      unit: product.unit,
      quantity: new FormControl('0'),
      subtotal: 0.00,
      isNew: moment(product.createdDate).isAfter(moment().subtract(15, 'days'))
    };

    // update subtotal of row and total.
    newOrderItem.quantity.valueChanges
      .pipe(takeUntil(this._unsubscribe), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(val => {
        if (!val) {
          val = 0;
        }
        newOrderItem.subtotal = newOrderItem.unitPrice * val;
        this._updateTotalAmount();
      });
    return newOrderItem;
  }

  private _updateTotalAmount() {
    let newSubtotal = 0;
    for (let orderItem of this.orderItems.data) {
      newSubtotal += orderItem.subtotal;
    }
    this.order.subtotal = newSubtotal;
    this.order.fee = this._calculateFee(newSubtotal);
    this.order.feeExplanation = this._explainFee(this.order);
    this.order.totalAmount = newSubtotal + this.order.fee;

  }

  private _calculateFee(subtotal: number): number {
    let newFee = 0;
    if (this.isFeeApplicable()) {
      if (this._client.feeType === 'Fixed') {
        newFee = Number(this._client.feeValue);
      }
      if (this._client.feeType === 'Rate') {
        newFee = subtotal * this._client.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _explainFee(order:any): string {
    let text = '';
    if (this.isFeeApplicable()) {
      if (this._client.feeType === 'Fixed') {
        text = 'Fixed amount';
      }
      if (this._client.feeType === 'Rate') {
        text = `$${order.subtotal.toFixed(2)} x ${this._client.feeValue}(%) = ${order.fee.toFixed(2)}`;
      }
    }
    return text;
  }

  private _setTableDataSource(orderItems: Array<OrderItem>) {
    this.orderItems = new MatTableDataSource(orderItems);
    setTimeout(() => {
      // set focus on first item
      if (this.firstItem) {
        this.firstItem.nativeElement.select();
      }
    });
  }
}
