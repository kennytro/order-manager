import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { ClientsComponent } from './clients.component';
import { DataApiService } from '../../../services/data-api.service';

describe('ClientsComponent', () => {
  const testClients = [
    { id: '1000', name: 'testA', phone: '1111111111', deliveryRouteId: 'routeA', createdDate: '1/1/2019' }
  ];
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ clients: testClients} ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ ClientsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['find']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count clients', () => {
    expect(component.getClientsCount()).toEqual(testClients.length, 'expect test clients count');
  });  
});
