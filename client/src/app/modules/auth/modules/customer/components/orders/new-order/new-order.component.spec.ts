import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { NewOrderComponent } from './new-order.component';
import { DataApiService } from '../../../services/data-api.service';

describe('NewOrderComponent', () => {
  const testClient = { id: '1000', name: 'test' };
  const testUser = { id: '2000', clientId: '1000', email: 'kenny@etr.com', userSettings: { productExcluded: ['2000'] } };
  const testProducts = [
    { id: '2000', name: 'Grape', description: 'grape', category: 'fruit', unitPrice: '10.00', unit: 'lb' },
    { id: '2001', name: 'Coke', description: 'Coca cola', category: 'beverage', unitPrice: '20.00', unit: 'case' }
  ];
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  beforeEach(async(() => {
    const route = ({ data: of({ endUser: testUser, products: testProducts } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ NewOrderComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'path']) },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(testClient));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should exclude a product', () => {
    expect(component.orderItems.data.length).toEqual(1, 'expect a product "2000" excluded');
  });
});
