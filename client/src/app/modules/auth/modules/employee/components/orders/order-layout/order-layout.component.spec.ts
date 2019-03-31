import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderLayoutComponent } from './order-layout.component';

describe('OrderLayoutComponent', () => {
  let component: OrderLayoutComponent;
  let fixture: ComponentFixture<OrderLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
