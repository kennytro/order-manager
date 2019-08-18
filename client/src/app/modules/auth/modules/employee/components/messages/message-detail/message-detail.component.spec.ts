import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { MessageDetailComponent } from './message-detail.component';

describe('MessageDetailComponent', () => {
  let component: MessageDetailComponent;
  let fixture: ComponentFixture<MessageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessageDetailComponent],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { data: { new: true } } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
