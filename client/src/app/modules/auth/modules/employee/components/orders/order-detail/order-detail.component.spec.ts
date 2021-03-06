import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { OrderDetailComponent } from './order-detail.component';
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
  library.add(faQuestionCircle);

  beforeEach(async(() => {
    const route = ({ data: of({ orderInfo: { order: testOrder, products: [] } } ), snapshot: {} } as any) as ActivatedRoute;

    TestBed.configureTestingModule({
      declarations: [ OrderDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'path']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
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
});
