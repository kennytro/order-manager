import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDeliveryRouteComponent } from './new-delivery-route.component';

describe('NewDeliveryRouteComponent', () => {
  let component: NewDeliveryRouteComponent;
  let fixture: ComponentFixture<NewDeliveryRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDeliveryRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDeliveryRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
