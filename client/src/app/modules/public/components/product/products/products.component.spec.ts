import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PublicModule } from '../../../public.module';
import { of } from 'rxjs';

import { ProductResolver } from '../../../services/product.resolver';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  const testProducts = [
    {
      name: 'grape', description: 'Grape', category: 'fruit', unitPrice: '10.00', unit: 'lb', createdDate: '2019-01-01' 
    }
  ];
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, PublicModule ],
      providers: [
        { provide: ProductResolver, useValue: jasmine.createSpyObj('ProductResolver', ['getProducts'])}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    let prodSvcSpy = TestBed.get(ProductResolver);
    prodSvcSpy.getProducts.and.returnValue(of(testProducts));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
