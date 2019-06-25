import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { ProductsComponent } from './products.component';
import { DataApiService } from '../../../services/data-api.service';
describe('ProductsComponent', () => {
  const testProducts = [
    {
      id: '1111', name: 'grape', description: 'Grape', category: 'fruit', originCountry: 'USA', unitPrice: '10.00', unit: 'lb', settings: {}
    }
  ];
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ products: testProducts} ), snapshot: {} } as any) as ActivatedRoute;

    TestBed.configureTestingModule({
      declarations: [ ProductsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find', 'genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count product', () => {
    expect(component.getProductsCount()).toEqual(testProducts.length);
  });
});
