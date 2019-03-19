import { Component, OnInit /*, ViewChild*/ } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatStepper, MatSnackBar } from '@angular/material';
import { MatSort, MatTableDataSource} from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DataApiService } from '../../services/data-api.service';
import { AuthService, UserProfile } from '../../../../../../services/auth.service';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  displayedColumns = ['id', 'name', 'description', 'category', 'unitPrice', 'quantity', 'subTotal'];
  products: MatTableDataSource<any>;
  orderFG: FormGroup;
  subTotal: number = 0.00;
  fee: number = 0.00;
  totalAmount: number = 0.00;
  private _endUser: any;
  private _client: any;

  // disabling sort because it doesn't work with form group in row
//  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _auth: AuthService,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
  ) { }

  ngOnInit() {
    this._dataApi.genericMethod('Client', 'getMyClient', [this._auth.getUserProfile().clientId])
      .subscribe(result => {
        this._client = result;
      });
    this._route.data.subscribe(routeData => {
      if (routeData['endUser']) {
        this._endUser = routeData['endUser'];
      }
      if (routeData['products']) {
        this.orderFG = this._formBuilder.group({
          products: this._formBuilder.array([]),
          subtotal: [''],
          fee: [''],
          note: ['']
        });
        let productsFA = this.orderFG.get('products') as FormArray;
        let products = sortBy(routeData['products'], ['category', 'name']);
        for (let product of products) {
          productsFA.push(this._createItem(product));
        }
        this._setTableDataSource(productsFA);
      }
    });
  }

  async create() {
    console.log('TO DO: create new order');
  }

  getOrderItemTableSource() {
    const rows = this.orderFG.get('products').value;
    return new MatTableDataSource(rows.filter(row => row.quantity > '0'));
  }

  explainFee(): string {
    let text = '';
    if (this._client) {
      if (this._client.feeType == 'Fixed') {
        text = 'Fixed amount';
      }
      if (this._client.feeType == 'Rate') {
        text = `$${this.subTotal} x ${this._client.feeValue}(%) = ${this.fee}`;
      }
    }
    return text;
  }

  private _createItem(product): FormGroup {
    let newFG = this._formBuilder.group({
      id: product.id,
      imageUrl: get(product, ['settings', 'imageUrl']),
      name: product.name,
      description: product.description,
      category: product.category,
      unitPrice: product.unitPrice,
      unit: product.unit,
      quantity: '0',
      subTotal: '0.00'
    });

    // update subtotal of row and total.
    newFG.get('quantity').valueChanges.subscribe(val => {
      newFG.get('subTotal').setValue(newFG.get('unitPrice').value * val);
      this._updateTotalAmount();
    });
    return newFG;
  }

  private _updateTotalAmount() {
    const rows = this.orderFG.get('products') as FormArray;
    let newTotal = 0;
    for (let row of rows.controls) {
      newTotal += Number(row.get('subTotal').value);
    }
    this.subTotal = newTotal;
    this.fee = this._calculateFee(newTotal);
    this.totalAmount = newTotal + this.fee;
  }

  private _calculateFee(subTotal: number): number {
    let newFee = 0;
    if (this._client) {
      if (this._client.feeType == 'Fixed') {
        newFee = this._client.feeValue;
      }
      if (this._client.feeType == 'Rate') {
        newFee = subTotal * this._client.feeValue / 100.0;
      }
    }
    return newFee;
  }

  private _setTableDataSource(products: FormArray) {
    if (this._endUser) {
      // remove products the user does not want.
      let excluded = get(this._endUser, ['userSettings', 'productExcluded'], []);
      if (excluded.length > 0) {
        products.controls = products.controls.filter(control => !excluded.includes(control.get('id').value));
      }
    }
    this.products = new MatTableDataSource(products.controls);
  }
}
