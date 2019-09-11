import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AgmCoreModule } from '@agm/core';
import { RouteMapComponent } from './route-map.component';
import { of } from 'rxjs';

import { DataApiService } from '../../../../services/data-api.service';

describe('RouteMapComponent', () => {
  const testCompany = { name: 'TEST', locationLat: 0, locationLng: 0 };
  let component: RouteMapComponent;
  let fixture: ComponentFixture<RouteMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteMapComponent ],
      imports: [ AgmCoreModule.forRoot() ],
      providers: [
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteMapComponent);
    component = fixture.componentInstance;
    let apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.and.returnValue(of(testCompany));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get latitude', () => {
    expect(component.latitude()).toEqual(testCompany.locationLat);
  });
  it('should get longitude', () => {
    expect(component.longitude()).toEqual(testCompany.locationLng);
  });
});
