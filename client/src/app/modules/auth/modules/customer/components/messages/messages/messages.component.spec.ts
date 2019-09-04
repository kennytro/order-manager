import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MessagesComponent } from './messages.component';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';

import { AuthService, UserProfile } from '../../../../../../../services/auth.service';
import { DataApiService } from '../../../services/data-api.service';
import { SocketService } from '../../../../../shared/services/socket.service';

describe('MessagesComponent', () => {
  const testProfile = {
    email: 'kenny@etr.com',
    authId: 'AAAAAA',
    clientId: '',
    pictureUrl: ''
  };
  const testMsgs = [
    { id: '1000', messageType: 'Message', fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' },
    { id: '1001', messageType: 'Announcement',fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' },
    { id: '1002', messageType: 'Inquiry',fromUser: 'TestUser', subject: 'Test', createdAt: '1/1/2019' }
  ];

  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;

  beforeEach(async(() => {
    const route = ({ data: of({ messages: testMsgs} ), snapshot: {} } as any) as ActivatedRoute;    
    TestBed.configureTestingModule({
      declarations: [ MessagesComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['getUserProfile']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.withArgs('EndUser', 'getMyUser', [testProfile.authId]).and.returnValue(of({ id: 1000 }));
    authSpy = TestBed.get(AuthService);
    authSpy.getUserProfile.and.returnValue(testProfile);
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
