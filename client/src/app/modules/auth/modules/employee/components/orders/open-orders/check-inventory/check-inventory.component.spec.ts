import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInventoryComponent } from './check-inventory.component';

describe('CheckInventoryComponent', () => {
  let component: CheckInventoryComponent;
  let fixture: ComponentFixture<CheckInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
