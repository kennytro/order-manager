import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faBullhorn, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { DataApiService } from '../../../services/data-api.service';

import { MessageDetailComponent, MessageDialogData } from './message-detail.component';

describe('MessageDetailComponent', () => {
  const msgData: MessageDialogData = {
    new: true
  };
  let component: MessageDetailComponent;
  let fixture: ComponentFixture<MessageDetailComponent>;

  library.add(faEnvelope, faBullhorn, faTrashAlt);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessageDetailComponent],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: msgData },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        FormBuilder,
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) }
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
