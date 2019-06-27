import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTag, faFolderOpen, faArrowsAltV, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { ProductDetailComponent } from './product-detail.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';
import { ProductService } from '../../../services/product.service';

describe('ProductDetailComponent', () => {
  const noImage = require('../../../../../../../../assets/img/no-picture.png');
  const testProduct = {
    id: '1111', name: 'grape', description: 'Grape', category: 'fruit', originCountry: 'USA', unitPrice: '10.00', unit: 'lb', settings: {}
  };
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let prodSvcSpy: jasmine.SpyObj<ProductService>;
  library.add(faTag, faFolderOpen, faArrowsAltV, faUndoAlt);
  
  beforeEach(async(() => {
    const route = ({ data: of({ product: testProduct} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ ProductDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule, ImageCropperModule],      
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['upsert', 'destroyById']) },
        { provide: AlertService, useValue: jasmine.createSpyObj('DataApiService', ['confirm', 'alertSuccess']) },
        { provide: ProductService, useValue: jasmine.createSpyObj('ProductService', ['getImage', 'getNoPictureImage', 'putImageToS3']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    prodSvcSpy = TestBed.get(ProductService);
    prodSvcSpy.getNoPictureImage.and.returnValue(noImage);
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
