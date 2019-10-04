import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { TodaysOrdersComponent } from './todays-orders.component';
import { FileService } from '../../../../../shared/services/file.service';
import { SocketService } from '../../../../../shared/services/socket.service';
import { DataApiService } from '../../../services/data-api.service';

describe('TodaysOrdersComponent', () => {
  const testOrders = [
    { id: '1000', client: { id: '1100', name: 'test' }, status: 'Submitted', totalAmount: '100.01', note: '', createdAt: '1/1/2019', hasInvoice: false }
  ];
  let component: TodaysOrdersComponent;
  let fixture: ComponentFixture<TodaysOrdersComponent>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  beforeEach(async(() => {
    const route = ({ data: of({ orders: testOrders} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ TodaysOrdersComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysOrdersComponent);
    component = fixture.componentInstance;
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
