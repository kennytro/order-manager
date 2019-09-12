import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';


import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { DeliveryRoutesComponent } from './delivery-routes.component';
import { HistoryGraphComponent } from '../../charts/history-graph/history-graph.component';
import { RankGraphComponent } from '../../charts/rank-graph/rank-graph.component';
import { RouteMapComponent } from './route-map/route-map.component'

import { DataApiService } from '../../../services/data-api.service';
describe('DeliveryRoutesComponent', () => {
  const testCompany = { name: 'TEST', locationLat: '0', locationLng: '0' };
  const testRoutes = [
    { id: '1000', description: 'test Route', driverName: 'Test Driver', driverPhone: '1111111111' }
  ];
  let component: DeliveryRoutesComponent;
  let fixture: ComponentFixture<DeliveryRoutesComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  library.add(faMapMarkedAlt);
  beforeEach(async(() => {
    const route = ({ data: of({ routes: testRoutes} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ DeliveryRoutesComponent, HistoryGraphComponent, RankGraphComponent, RouteMapComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule, AgmCoreModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find', 'genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryRoutesComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.withArgs('CompanyInfo', 'getCompanyInfo').and.returnValue(of(testCompany));
    apiSpy.genericMethod.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count routes', () => {
    expect(component.getDeliveryRoutesCount()).toEqual(1, 'expect route count');
  });
});
