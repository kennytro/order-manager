import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AgmCoreModule } from '@agm/core';
import { RouteMapComponent } from './route-map.component';

import { DataApiService } from '../../../../services/data-api.service';

describe('RouteMapComponent', () => {
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
