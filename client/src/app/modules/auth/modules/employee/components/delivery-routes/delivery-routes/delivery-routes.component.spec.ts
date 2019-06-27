import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { DeliveryRoutesComponent } from './delivery-routes.component';
import { DataApiService } from '../../../services/data-api.service';
describe('DeliveryRoutesComponent', () => {
  const testRoutes = [
    { id: '1000', description: 'test Route', driverName: 'Test Driver', driverPhone: '1111111111' }
  ];
  let component: DeliveryRoutesComponent;
  let fixture: ComponentFixture<DeliveryRoutesComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ routes: testRoutes} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ DeliveryRoutesComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count routes', () => {
    expect(component.getDeliveryRoutesCount()).toEqual(1, 'expect route count');
  });
});
