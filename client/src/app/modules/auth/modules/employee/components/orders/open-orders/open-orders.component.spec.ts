import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { OpenOrdersComponent } from './open-orders.component';
import { DataApiService } from '../../../services/data-api.service';

describe('OpenOrdersComponent', () => {
  const testOrders = [
    { id: '1000', client: { id: '1100', name: 'test' }, status: 'Submitted', totalAmount: '100.01', note: '', createdAt: '1/1/2019' },
    { id: '1001', client: { id: '1101', name: 'test1' }, status: 'Processed', totalAmount: '100.01', note: '', createdAt: '1/1/2019' },
    { id: '1002', client: { id: '1102', name: 'test2' }, status: 'Shipped', totalAmount: '100.01', note: '', createdAt: '1/1/2019' }
  ];
  let component: OpenOrdersComponent;
  let fixture: ComponentFixture<OpenOrdersComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ orders: testOrders} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OpenOrdersComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod', 'find']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
