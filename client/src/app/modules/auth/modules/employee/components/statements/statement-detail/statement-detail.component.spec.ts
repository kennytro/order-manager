import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoiceDollar, faExclamationCircle, faEdit } from '@fortawesome/free-solid-svg-icons';

import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { StatementDetailComponent } from './statement-detail.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

describe('StatementDetailComponent', () => {
  let component: StatementDetailComponent;
  let fixture: ComponentFixture<StatementDetailComponent>;
  let alertSpy: jasmine.SpyObj<AlertService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;

  library.add(faFileInvoiceDollar, faExclamationCircle, faEdit);

  beforeEach(async(() => {
    const testStatment = {
      id: '1000',
      statementDate: '1/1/2019',
      totalAmount: '1000.00',
      feeAmount: '20.00',
      adjustAmount: '0.00',
      adjustReason: '',
      note: '',
      order: [],
      client: { id: '1000', name: 'testClient', feeSchedule: 'Statement', feeType: 'Fixed', feeValue: '20.00' },
      userCreated: { id: '1000', email: 'kenny@etr.com' }
    };
    const testStmtInfo = {
      statement: testStatment,
      candidateOrders: [],
      products: []
    };
    const route = ({ data: of({ statementInfo: testStmtInfo} ), snapshot: {} } as any) as ActivatedRoute;
    const dataSpy = jasmine.createSpyObj('DataApiService', ['genericMethod', 'destroyById']);
    const fsSpy = jasmine.createSpyObj('FileService', ['downloadPDF']);
    const asSpy = jasmine.createSpyObj('AlertService', ['confirm', 'alertSuccess']);

    TestBed.configureTestingModule({
      declarations: [ StatementDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'path']) },
        { provide: MatDialog, useValue: { open: () => {} } },
        { provide: AlertService, useValue: asSpy },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: FileService, useValue: fsSpy },
        { provide: DataApiService, useValue: dataSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementDetailComponent);
    component = fixture.componentInstance;
    alertSpy = TestBed.get(AlertService);
    apiSpy = TestBed.get(DataApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get creator user email', () => {
    expect(component.getEmailCreated()).toEqual('kenny@etr.com');
  });
  it('should get fee applicable', () => {
    expect(component.isFeeApplicable()).toEqual(true, 'expected fee applicable');
  });
});
