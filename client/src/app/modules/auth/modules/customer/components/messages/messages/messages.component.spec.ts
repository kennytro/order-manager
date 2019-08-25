import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MessagesComponent } from './messages.component';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { DataApiService } from '../../../services/data-api.service';


describe('MessagesComponent', () => {
  const testMsgs = [
    { id: '1000', messageType: 'Message', fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' },
    { id: '1001', messageType: 'Announcement',fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' },
    { id: '1002', messageType: 'Inquiry',fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' }
  ];

  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async(() => {
    const route = ({ data: of({ messages: testMsgs} ), snapshot: {} } as any) as ActivatedRoute;    
    TestBed.configureTestingModule({
      declarations: [ MessagesComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod', 'find']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
