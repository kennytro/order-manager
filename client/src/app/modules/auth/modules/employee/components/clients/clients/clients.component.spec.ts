import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { ClientsComponent } from './clients.component';
import { HistoryGraphComponent } from '../../charts/history-graph/history-graph.component';

import { DataApiService } from '../../../services/data-api.service';

describe('ClientsComponent', () => {
  const testClients = [
    { id: '1000', name: 'testA', phone: '1111111111', deliveryRoute: { id: 1000, name: 'routeA' }, createdDate: '1/1/2019' }
  ];
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  beforeEach(async(() => {
    const route = ({ data: of({ clients: testClients} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ ClientsComponent, HistoryGraphComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find', 'genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count clients', () => {
    expect(component.getClientsCount()).toEqual(testClients.length, 'expect test clients count');
  });  
});
