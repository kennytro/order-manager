import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { OrdersComponent } from './orders.component';
import { FileService } from '../../../../../shared/services/file.service';
import { SocketService } from '../../../../../shared/services/socket.service';
import { DataApiService } from '../../../services/data-api.service';

describe('OrdersComponent', () => {
  const testOrders = [
    { id: 1000, client: { id: 1100, name: 'test' }, status: 'Submitted', totalAmount: 100.01, note: '', createdAt: '1/1/2019' }
  ];
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  beforeEach(async(() => {
    const route = ({ data: of({ orders: testOrders } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ OrdersComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: CookieService, useValue: jasmine.createSpyObj('CookieService', ['get']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['downloadPDF']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    cookieSpy = TestBed.get(CookieService);
    cookieSpy.get.and.returnValue('1100');
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
