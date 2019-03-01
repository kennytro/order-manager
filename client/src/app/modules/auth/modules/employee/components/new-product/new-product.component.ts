import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatStepper, MatSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataApiService } from '../../services/data-api.service';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.css']
})
export class NewProductComponent implements OnInit {
  unitList = ['lb', 'kg', 'oz', 'case', 'dozen', 'each'];
  productFG: FormGroup;

  constructor(
    private _dialogRef: MatDialogRef<NewProductComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService
   ) { }

  ngOnInit() {
    this.productFG = this._formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      unitPrice: ['', Validators.required],
      unit: [''],
      inventoryCount: [''],
      showPublic: false
    });
  }

  async create() {
    try {
      let product = await this._dataApi.upsert('Product', this.productFG.value).toPromise();
      const snackBarRef = this._snackBar.open(`Product(name: ${product.name}) successfully created`,
        'Close', { duration: 3000 });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
      this._dialogRef.close(true);
    } catch (err) {
      console.log(`error: failed to create a product(name: ${this.productFG.value.name}) - ${err.message}`);
    }
  }
}
