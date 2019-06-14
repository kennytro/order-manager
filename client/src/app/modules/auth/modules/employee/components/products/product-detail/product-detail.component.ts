declare function require(path: string);
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper'
import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';
import { ProductService } from '../../../services/product.service';

import assign from 'lodash/assign';
import get from 'lodash/get';
import set from 'lodash/set';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  unitList = ['lb', 'kg', 'oz', 'case', 'dozen', 'each'];
  product: any;
  productFG: FormGroup;
  imageBase64: any;        // image data
  croppedImage: any = '';
  showCropper = false;
  imageChanged = false;
  private _fileReader = new FileReader();

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _alertSvc: AlertService,
    private _productSvc: ProductService
  ) {
    let self = this;
    this._fileReader.addEventListener('load', function() {
      self.imageBase64 = this.result;
    });
  }

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
        originCountry: [this.product.originCountry],
        unitPrice: [this.product.unitPrice, Validators.required],
        unit: [this.product.unit],
        inventoryCount: [this.product.inventoryCount],
        showPublic: [this.product.showPublic],
        isAvailable: [this.product.isAvailable]
      })
      const imageUrl = get(this.product, ['settings', 'imageUrl']);
      if (imageUrl) {
        this._productSvc.getImage(imageUrl)
          .subscribe(data => {
            this._fileReader.readAsDataURL(data);
          });
      } else {
        this.imageBase64 = this._productSvc.getNoPictureImage();
      }
    });
  }

  fileChangeEvent(event: any): void {
    if (event && event.target && event.target.files && event.target.files.length > 0) {
       this._fileReader.readAsDataURL(event.target.files[0]);
       this.imageChanged = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
     console.log('Image loaded')
  }

  cropperReady() {
    console.log('Cropper ready')
  }

  loadImageFailed () {
    console.log('Load failed');
  }

  flipVertical() {
    this.imageCropper.flipVertical();
  }

  rotateLeft() {
    this.imageCropper.rotateLeft();
  }

  async save() {
    try {
      this.product = assign(this.product, this.productFG.value);
      if (this.imageChanged) {  // inform back-end to prepare pre-signed URL
        set(this.product, ['settings', 'hasImage'], true);
      };
      let product = await this._dataApi.upsert('Product', this.product).toPromise();
      if (product && this.imageChanged && get(product, ['presignedImageUrl'])) {
        await this._productSvc.putImageToS3(this.croppedImage, get(product, ['presignedImageUrl']));
      }
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
    this._alertSvc.confirm('Are you sure?', 'Deleting this product cannot be undone and will invalidate existing orders. You may want to make unavailable instead? ', async () => {
      try {
        await this._dataApi.destroyById('Product', this.product.id.toString()).toPromise();
        this._alertSvc.alertSuccess('Success', `Successfully deleted product(id: ${this.product.id})`, () => {
          this._router.navigate(['../'], { relativeTo: this._route });
        });
      } catch (error) {
        if (error.status === 409) {
          const snackBarRef = this._snackBar.open(`Product(id: ${this.product.id}) cannot be deleted - ${error.message}`, 'Close');
          snackBarRef.onAction().subscribe(() => {
            snackBarRef.dismiss();
          });
        }
      }
    });
  }
}
