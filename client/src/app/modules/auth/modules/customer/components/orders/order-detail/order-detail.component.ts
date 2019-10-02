import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTableDataSource, MatSnackBar /* , MatStepper*/ } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { ConfirmDialogComponent, DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RootScopeShareService } from '../../../../../../../services/root-scope-share.service';
import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  static readonly defaultColumns = ['id', 'name', 'description', 'category', 'quantity', 'unitPrice', 'subtotal'];
  static readonly noPriceColumns = ['id', 'name', 'description', 'category', 'quantity', 'unit'];
  displayedColumns: Array<string>;
  orderItems: MatTableDataSource<any>;
  order: any;
  orderFG: FormGroup;
  hidePrice: boolean;
  private _unsubscribe = new Subject<boolean>(); 

  /* First row in order item table that should set selected initially */ 
  @ViewChild('firstItem') firstItem: ElementRef;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _fs: FileService,
    private _dataApi: DataApiService,
    private _dataShare: RootScopeShareService
  ) {
    this.hidePrice = false;
    this.displayedColumns = OrderDetailComponent.defaultColumns;
  }

  ngOnInit() {
    /***** Form initialization *****/
    this.orderFG = this._formBuilder.group({
      clientInfo: [''],
      orderItemQuantities: this._formBuilder.array([]),
      note: ['']
    });

    /***** Data initialization: order and product list *****/
    this._route.data
      .pipe(take(1))
      .subscribe(routeData => {
        if (routeData['orderInfo']) {
          let orderInfo = routeData['orderInfo'];
          this._setOrderObject(orderInfo.order);
          this._hideColumns(this._dataShare.getData('tenant'), this.order);

          let existingOrderItems = this.order.orderItem;
          let products = orderInfo.products;
          let productExclusionList = orderInfo.productExclusionList;

          // build array of order item.
          let orderItems = new Array() as Array<OrderItem>;
          let quantitiesControl = <FormArray>this.orderFG.get('orderItemQuantities');
          for (let product of sortBy(products, ['category', 'name'])) {
            // include existing order item
            let existingOrderItem = existingOrderItems.find((oi) => oi.productId == product.id);
            if (existingOrderItem) {
              let orderItem = this._createItem(product, existingOrderItem);
              orderItems.push(orderItem);
              quantitiesControl.push(orderItem.quantity);
            } else {
              // add additional item if order can be changed and
              // item is not in exclusion list.
              if (this.order.status == 'Submitted' &&
                  !productExclusionList.includes(product.id)) {
                let orderItem = this._createItem(product);
                orderItems.push(orderItem);
                quantitiesControl.push(orderItem.quantity);
              }
            }
          }
          this.orderItems = new MatTableDataSource(orderItems);
          setTimeout(() => {
            // set focus on first item
            if (this.firstItem) {
              this.firstItem.nativeElement.select();
            }
          });
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribe.next(true);
    this._unsubscribe.unsubscribe();
  }

  getReviewItemTableSource() {
    const rows = this.orderItems.data;
    return new MatTableDataSource(rows.filter(row => row.quantity.value > '0'));
  }

  /* Fee is applicable only if fee schedule is 'Order'.
   */ 
  isFeeApplicable(): boolean {
    return this.order.client && this.order.client.feeSchedule === 'Order';
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
      this._router.navigate(['../'], { relativeTo: this._route});
    } catch (err) {
      console.log(`error: failed to update an order - ${err.message}`);
    }
  }

  /**
   * 'unitPrice' & 'subtotal' columns are shown by default. They are replaced with 'unit' if
   *  1. tenant configuration hides price information AND
   *  2. order status is before 'Shipped'
   * @param {Object} - tenant configuration
   * @param {Object} - order instance
   */
  private _hideColumns(tenant: any, order: any): void {
    if (tenant && tenant.hidePriceFromCustomer &&
      ['Submitted', 'Processed'].includes(order.status)) {
      this.hidePrice = true;
      this.displayedColumns = OrderDetailComponent.noPriceColumns;
    } else {
      this.hidePrice = false;
      this.displayedColumns = OrderDetailComponent.defaultColumns;
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
    if (this.isFeeApplicable()) {
      if (this.order.client.feeType == 'Fixed') {
        newFee = Number(this.order.client.feeValue);
      }
      if (this.order.client.feeType == 'Rate') {
        newFee = subtotal * this.order.client.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _explainFee(order:any): string {
    let text = '';
    if (this.isFeeApplicable()) {
      if (this.order.client.feeType === 'Fixed') {
        text = 'Fixed amount';
      }
      if (this.order.client.feeType === 'Rate') {
        text = `$${order.subtotal.toFixed(2)} x ${this.order.client.feeValue}(%) = $${order.fee.toFixed(2)}`;
      }
    }
    return text;
  }

  private _updateTotalAmount() {
    let newSubtotal = 0;
    for (let element of this.orderItems.data) {
      newSubtotal += Number(element.subtotal);
    }
    this.order.subtotal = newSubtotal;
    this.order.fee = this._calculateFee(newSubtotal);
    this.order.feeExplanation = this._explainFee(this.order);
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
