import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
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
  clientList: Array<any>;
  selectedClient: any;
  orderFG: FormGroup;
  private _unsubscribe = new Subject<boolean>();

  /* First row in order item table that should set selected initially */ 
  @ViewChild('firstItem') firstItem: ElementRef;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { 
    this.order = {
      subtotal: 0,
      fee: 0,
      totalAmount: 0,
      feeExplanation: '',      
      note: null
    };
  }

  ngOnInit() {
    /***** Form initialization *****/
    this.orderFG = this._formBuilder.group({
      clientId: ['', Validators.required],
      orderItemQuantities: this._formBuilder.array([]),
      note: ['']
    });
    
    this.orderFG.get('clientId').valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(clientId => {
        this.selectedClient = this.clientList.find(client => client.id === clientId);
        this.order.clientId = this.selectedClient.id;
        this._updateTotalAmount();    // client change may affect fee and total amount.
      });

    /***** Data initialization: client and product list *****/
    this._route.data.subscribe(routeData => {
      if (routeData['clients']) {
        this.clientList = routeData['clients'].map(client => {
          return {
            id: client.id,
            name: client.name,
            feeSchedule: client.feeSchedule,
            feeType: client.feeType,
            feeValue: client.feeValue
          };
        });
      }
    });

    this._dataApi.find('Product', { where: { isAvailable: true }})
      .subscribe(products => {
        products = sortBy(products, ['category', 'name']);
        let orderItems:OrderItem[] = [];
        let quantitiesControl = <FormArray>this.orderFG.get('orderItemQuantities');
        for (let product of products) {
          let orderItem = this._createOrderItem(product);
          orderItems.push(orderItem);
          quantitiesControl.push(orderItem.quantity);
        }
        this._setTableDataSource(orderItems);
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  /*
   * When certain step(the one with order items) is selected, we want to 
   * highlight the first item for better UX.
   * @param {Object} - event 
   */
  onStepChange(event: any): void {
    if(event.selectedIndex === 1) {
      setTimeout(() => {
        // set focus on first item
        if (this.firstItem) {
          this.firstItem.nativeElement.select();
        }
      }, 100);
    }
  }

  getOrderItemTableSource() {
    if (this.orderItems) {
      const rows = this.orderItems.data;
      return new MatTableDataSource(rows.filter(row => row.quantity.value > 0));
    }
    return new MatTableDataSource([]);
  }

  /* Fee is applicable only if fee schedule is 'Order'. */ 
  isFeeApplicable(): boolean {
    return this.selectedClient && this.selectedClient.feeSchedule === 'Order';
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

  private _createOrderItem(product) {
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
    this.order.feeExplanation = this._explainFee(this.order);
    this.order.totalAmount = newSubtotal + this.order.fee;
  }

  private _calculateFee(subtotal: number): number {
    let newFee = 0;
    if (this.isFeeApplicable()) {
      if (this.selectedClient.feeType == 'Fixed') {
        newFee = Number(this.selectedClient.feeValue);
      }
      if (this.selectedClient.feeType == 'Rate') {
        newFee = subtotal * this.selectedClient.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _explainFee(order:any): string {
    let text = '';
    if (this.isFeeApplicable()) {
      if (this.selectedClient.feeType === 'Fixed') {
        text = 'Fixed amount';
      }
      if (this.selectedClient.feeType === 'Rate') {
        text = `$${order.subtotal.toFixed(2)} x ${this.selectedClient.feeValue}(%) = $${order.fee.toFixed(2)}`;
      }
    }
    return text;
  }

  private _setTableDataSource(products: Array<OrderItem>) {
    this.orderItems = new MatTableDataSource(products);
  }
}
