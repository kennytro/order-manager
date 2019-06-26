import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { of } from 'rxjs';

import { TextMaskModule } from 'angular2-text-mask';
import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { ClientDetailComponent } from './client-detail.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';

describe('ClientDetailComponent', () => {
  const testClient = { id: '1000', name: 'testA', phone: '1111111111', deliveryRouteId: 'routeA', createdDate: '1/1/2019' };
  const testRoutes = [
    { id: '1000', description: 'test Route', driverName: 'Test Driver', driverPhone: '1111111111' }
  ];
  let component: ClientDetailComponent;
  let fixture: ComponentFixture<ClientDetailComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ client: testClient, deliveryRoutes: testRoutes} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ ClientDetailComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule, TextMaskModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: AlertService, useValue: jasmine.createSpyObj('AlertService', ['confirm', 'alertSuccess']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['destroyById', 'upsert']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
