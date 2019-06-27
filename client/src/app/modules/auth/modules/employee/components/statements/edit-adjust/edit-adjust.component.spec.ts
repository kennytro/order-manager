import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder } from '@angular/forms';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { EditAdjustComponent } from './edit-adjust.component';

describe('EditAdjustComponent', () => {
  let component: EditAdjustComponent;
  let fixture: ComponentFixture<EditAdjustComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAdjustComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { data: { amount: '100', reason: 'test' } } }
      ]
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
