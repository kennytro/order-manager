import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { TotalOrdersComponent } from './total-orders.component';
import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

describe('TotalOrdersComponent', () => {
  let component: TotalOrdersComponent;
  let fixture: ComponentFixture<TotalOrdersComponent>;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalOrdersComponent ],
      imports: [ AuthSharedModule, NoopAnimationsModule ],
      providers: [
        { provide: CookieService, useValue: jasmine.createSpyObj('CookieService', ['get']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalOrdersComponent);
    component = fixture.componentInstance;
    cookieSpy = TestBed.get(CookieService);
    cookieSpy.get.and.returnValue('1000');
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of([]));
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({operation: 'save', metricNames: ['test']}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
