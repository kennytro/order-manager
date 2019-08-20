import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faBullhorn } from '@fortawesome/free-solid-svg-icons';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { MessageDetailComponent, MessageDialogData } from './message-detail.component';

describe('MessageDetailComponent', () => {
  const msgData: MessageDialogData = {
    message: {
      messageType: 'Announcement',
      fromUser: 'test@etr.com',
      createdAt: new Date(),
      subject: 'TEST',
      body: 'TEST'
    }
  };
  library.add(faEnvelope, faBullhorn);  
  let component: MessageDetailComponent;
  let fixture: ComponentFixture<MessageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: msgData },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }
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
