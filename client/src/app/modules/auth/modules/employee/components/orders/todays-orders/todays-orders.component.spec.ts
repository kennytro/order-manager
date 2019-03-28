import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysOrdersComponent } from './todays-orders.component';

describe('TodaysOrdersComponent', () => {
  let component: TodaysOrdersComponent;
  let fixture: ComponentFixture<TodaysOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaysOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
