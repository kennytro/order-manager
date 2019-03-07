import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatStepper, MatSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DataApiService } from '../../services/data-api.service';
import { ProductService } from '../../services/product.service';

import get from 'lodash/get';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.css']
})
export class NewProductComponent implements OnInit {
  unitList = ['lb', 'kg', 'oz', 'case', 'dozen', 'each'];
  productFG: FormGroup;
  imageBase64: any;        // image data
  croppedImage: any = '';
  showCropper = false;
  hasImage = false;
  private _fileReader = new FileReader();

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  constructor(
    private _dialogRef: MatDialogRef<NewProductComponent>,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dataApi: DataApiService,
    private _productSvc: ProductService
   ) {
    let self = this;
    this._fileReader.addEventListener('load', function() {
      self.hasImage = true;
      self.imageBase64 = this.result;
    });
  }

  ngOnInit() {
    this.productFG = this._formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      unitPrice: ['', Validators.required],
      unit: [''],
      inventoryCount: [''],
      showPublic: false,
      isAvailable: true
    });
    this.imageBase64 = this._productSvc.getNoPictureImage();
  }

  fileChangeEvent(event: any): void {
    if (event && event.target && event.target.files && event.target.files.length > 0) {
       this._fileReader.readAsDataURL(event.target.files[0]);
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

  async create() {
    try {
      let product = this.productFG.value;
      product.settings = { hasImage: this.hasImage };    // inform back-end to prepare pre-signed URL
      product = await this._dataApi.upsert('Product', product).toPromise();
      if (this.hasImage) {
        this._productSvc.putImageToS3(this.croppedImage, get(product, ['presignedImageUrl']));
      }
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
