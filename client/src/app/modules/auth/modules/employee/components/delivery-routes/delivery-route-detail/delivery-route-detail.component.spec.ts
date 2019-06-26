import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { TextMaskModule } from 'angular2-text-mask';
import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { DeliveryRouteDetailComponent } from './delivery-route-detail.component';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';

describe('DeliveryRouteDetailComponent', () => {
  const testRoute = {
    id: '1000', description: 'test Route', driverName: 'Test Driver', driverPhone: '1111111111'
  };
  let component: DeliveryRouteDetailComponent;
  let fixture: ComponentFixture<DeliveryRouteDetailComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ route: testRoute} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ DeliveryRouteDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule, TextMaskModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        FormBuilder,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['upsert', 'destroyById']) },
        { provide: AlertService, useValue: jasmine.createSpyObj('AlertService', ['confirm', 'alertSuccess']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRouteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
