import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../../../../shared/services/alert.service';
import { DataApiService } from '../../services/data-api.service';

import assign from 'lodash/assign';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  unitList = ['lb', 'kg', 'oz', 'case', 'dozen', 'each'];
  product: any;
  productFG: FormGroup;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _alertSvc: AlertService
  ) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['product']) {
        this.product = routeData['product'];
      }
      this.productFG = this._formBuilder.group({
        id: [this.product.id, Validators.required],
        name: [this.product.name, Validators.required],
        description: [this.product.description, Validators.required],
        category: [this.product.category],
        unitPrice: [this.product.unitPrice, Validators.required],
        unit: [this.product.unit],
        inventoryCount: [this.product.inventoryCount],
        showPublic: [this.product.showPublic]
      })
    });
  }

  async save() {
    try {
      await this._dataApi.upsert('Product', assign(this.product, this.productFG.value)).toPromise();
      const snackBarRef = this._snackBar.open(`Product(id: ${this.product.id}) successfully saved`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } catch (err) {
      const snackBarRef = this._snackBar.open(`Product(id: ${this.product.id}) could not be saved - ${err.message}`, 'Close');
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    }
  }

  async delete() {
    this._alertSvc.confirm('Are you sure?', 'Deleting this product cannot be undone', async () => {
      await this._dataApi.destroyById('Product', this.product.id.toString()).toPromise();
      this._alertSvc.alertSuccess('Success', `Successfully deleted product(id: ${this.product.id})`, () => {
        this._router.navigate(['../'], { relativeTo: this._route });
      });
    });
  }
}
