import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { OrderDetailComponent } from './order-detail.component';
import { RootScopeShareService } from '../../../../../../../services/root-scope-share.service';
import { DialogData } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

describe('OrderDetailComponent', () => {
  const testOrder = {
    id: '1000',
    client: { id: '2000', name: 'testClient', feeSchedule: 'Order', feeType: 'Fixed', feeValue: '20.00' },
    status: 'Submitted',
    subtotal: '100.00',
    fee: '5.00',
    totalAmount: '105.00',
    orderItem: [],
    userCreated: { id: '1000', email: 'kenny@etr.com' },
    userUpdated: { id: '1000', email: 'kenny2@etr.com' },
  }
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let dataShareSpy: jasmine.SpyObj<RootScopeShareService>;

  beforeEach(async(() => {
    const route = ({ data: of({ orderInfo: { order: testOrder, products: [] } } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OrderDetailComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData'] )}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    dataShareSpy = TestBed.get(RootScopeShareService);
    dataShareSpy.getData.and.returnValue({ hidePriceFromCustomer: false });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get email', () => {
    expect(component.getEmailCreated()).toEqual(testOrder.userCreated.email, 'expected creator email');
    expect(component.getEmailUpdated()).toEqual(testOrder.userUpdated.email, 'expected updator email');
  });
  it('should get fee applicable', () => {
    expect(component.isFeeApplicable()).toEqual(true, 'expected fee applicable');
  });
  it('should display unitPrice and subtotal columns', () => {
    expect(component.displayedColumns.includes('unitPrice')).toBe(true, 'expect to display unitPrice');
    expect(component.displayedColumns.includes('subtotal')).toBe(true, 'expect to display subtotal'); 
    expect(component.displayedColumns.includes('unit')).toBe(false, 'expect not to display unit'); 
  });
});


describe('OrderDetailComponent - hide price and amount with Submitted order', () => {
  const testOrder = {
    id: '1000',
    client: { id: '2000', name: 'testClient', feeSchedule: 'Order', feeType: 'Fixed', feeValue: '20.00' },
    status: 'Submitted',
    subtotal: '100.00',
    fee: '5.00',
    totalAmount: '105.00',
    orderItem: [],
    userCreated: { id: '1000', email: 'kenny@etr.com' },
    userUpdated: { id: '1000', email: 'kenny2@etr.com' },
  }
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let dataShareSpy: jasmine.SpyObj<RootScopeShareService>;

  beforeEach(async(() => {
    const route = ({ data: of({ orderInfo: { order: testOrder, products: [] } } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OrderDetailComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData'] )}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    dataShareSpy = TestBed.get(RootScopeShareService);
    dataShareSpy.getData.and.returnValue({ hidePriceFromCustomer: true });
    fixture.detectChanges();
  });

  it('should display unit columns', () => {
    expect(component.displayedColumns.includes('unit')).toBe(true, 'expect to display unit'); 
    expect(component.displayedColumns.includes('unitPrice')).toBe(false, 'expect not to display unitPrice');
    expect(component.displayedColumns.includes('subtotal')).toBe(false, 'expect not to display subtotal'); 
  });
});

describe('OrderDetailComponent - hide price and amount with Processed order', () => {
  const testOrder = {
    id: '1000',
    client: { id: '2000', name: 'testClient', feeSchedule: 'Order', feeType: 'Fixed', feeValue: '20.00' },
    status: 'Processed',
    subtotal: '100.00',
    fee: '5.00',
    totalAmount: '105.00',
    orderItem: [],
    userCreated: { id: '1000', email: 'kenny@etr.com' },
    userUpdated: { id: '1000', email: 'kenny2@etr.com' },
  }
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let dataShareSpy: jasmine.SpyObj<RootScopeShareService>;

  beforeEach(async(() => {
    const route = ({ data: of({ orderInfo: { order: testOrder, products: [] } } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OrderDetailComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData'] )}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    dataShareSpy = TestBed.get(RootScopeShareService);
    dataShareSpy.getData.and.returnValue({ hidePriceFromCustomer: true });
    fixture.detectChanges();
  });

  it('should display unit columns', () => {
    expect(component.displayedColumns.includes('unit')).toBe(true, 'expect to display unit'); 
    expect(component.displayedColumns.includes('unitPrice')).toBe(false, 'expect not to display unitPrice');
    expect(component.displayedColumns.includes('subtotal')).toBe(false, 'expect not to display subtotal'); 
  });
});

describe('OrderDetailComponent - hide price and amount with Shipped order', () => {
  const testOrder = {
    id: '1000',
    client: { id: '2000', name: 'testClient', feeSchedule: 'Order', feeType: 'Fixed', feeValue: '20.00' },
    status: 'Shipped',
    subtotal: '100.00',
    fee: '5.00',
    totalAmount: '105.00',
    orderItem: [],
    userCreated: { id: '1000', email: 'kenny@etr.com' },
    userUpdated: { id: '1000', email: 'kenny2@etr.com' },
  }
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let dataShareSpy: jasmine.SpyObj<RootScopeShareService>;

  beforeEach(async(() => {
    const route = ({ data: of({ orderInfo: { order: testOrder, products: [] } } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OrderDetailComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData'] )}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    dataShareSpy = TestBed.get(RootScopeShareService);
    dataShareSpy.getData.and.returnValue({ hidePriceFromCustomer: true });
    fixture.detectChanges();
  });

  it('should display unitPrice and subtotal columns', () => {
    expect(component.displayedColumns.includes('unitPrice')).toBe(true, 'expect to display unitPrice');
    expect(component.displayedColumns.includes('subtotal')).toBe(true, 'expect to display subtotal'); 
    expect(component.displayedColumns.includes('unit')).toBe(false, 'expect not to display unit'); 
  });
});
