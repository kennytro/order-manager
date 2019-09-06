import { Component, OnInit /*, ViewChild*/ } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource, MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { DataApiService } from '../../../services/data-api.service';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  displayedColumns = ['id', 'name', 'description', 'category', 'quantity', 'unitPrice', 'subtotal'];
  orderItems: MatTableDataSource<OrderItem>;
  order: any;
  orderFG: FormGroup;
  private _unsubscribe = new Subject<boolean>();
  private _endUser: any;
  private _client: any;

  // disabling sort because it doesn't work with form group in row
//  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { 
    this.order = {
      clientId: '',
      subtotal: 0,
      fee: 0,
      totalAmount: 0,
      note: null
    };
  }

  ngOnInit() {
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

  explainFee(): string {
    let text = '';
    if (this._client) {
      if (this._client.feeType === 'Fixed') {
        text = 'Fixed amount';
      }
      if (this._client.feeType === 'Rate') {
        text = `$${this.order.subtotal.toFixed(2)} x ${this._client.feeValue}(%) = ${this.order.fee.toFixed(2)}`;
      }
    }
    return text;
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
      this._router.navigate(['../'], { relativeTo: this._route});
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
      subtotal: 0.00
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

  private _setTableDataSource(orderItems: Array<OrderItem>) {
    this.orderItems = new MatTableDataSource(orderItems);
  }
}
