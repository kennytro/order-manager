import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRouteDetailComponent } from './delivery-route-detail.component';

describe('DeliveryRouteDetailComponent', () => {
  let component: DeliveryRouteDetailComponent;
  let fixture: ComponentFixture<DeliveryRouteDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryRouteDetailComponent ]
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
