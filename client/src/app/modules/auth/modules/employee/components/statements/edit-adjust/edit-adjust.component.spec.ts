import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdjustComponent } from './edit-adjust.component';

describe('EditAdjustComponent', () => {
  let component: EditAdjustComponent;
  let fixture: ComponentFixture<EditAdjustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAdjustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAdjustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
