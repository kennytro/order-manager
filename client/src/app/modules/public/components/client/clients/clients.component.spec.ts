import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import { of } from 'rxjs';

import { PublicModule } from '../../../public.module';
import { ClientsComponent } from './clients.component';
import { ClientResolver } from '../../../services/client.resolver';

describe('ClientsComponent', () => {
  // const testLocations = {
  //   company: { name: 'TEST', lat: 11, lng: 22 },
  //   clients: [
  //     { name: 'Client1', lat: 22, lng: 33 },
  //     { name: 'Client1', lat: 22, lng: 33 }
  //   ]
  // };
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        PublicModule,
        AgmCoreModule.forRoot()         
      ],
      providers: [
        { provide: ClientResolver, useValue: jasmine.createSpyObj('ClientResolver', ['getLocations']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    let resolverSpy = TestBed.get(ClientResolver);
    resolverSpy.getLocations.and.returnValue(of(null));    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
