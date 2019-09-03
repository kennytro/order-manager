import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { of } from 'rxjs';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBell, faKey, faSignOutAlt, faChartLine, faUsers, faTruck } from '@fortawesome/free-solid-svg-icons';

import { AuthSharedModule } from '../../../../shared/auth-shared.module';
import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { EmployeeLayoutComponent } from './employee-layout.component';
import { AuthService } from '../../../../../../services/auth.service';
import { SocketService } from '../../../../shared/services/socket.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';
import { DataApiService } from '../../services/data-api.service';

describe('EmployeeLayoutComponent', () => {
  const testTenant = {
    id: 'om-app-dev',
    companyName: 'test'
  };
  const testProfile = {
    email: 'kenny@etr.com',
    authId: 'AAAAAA',
    clientId: '',
    pictureUrl: ''
  };
  let component: EmployeeLayoutComponent;
  let fixture: ComponentFixture<EmployeeLayoutComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let dataSvcSpy: jasmine.SpyObj<RootScopeShareService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  library.add(faBell, faKey, faSignOutAlt, faChartLine, faUsers, faTruck);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeLayoutComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule ],
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['isDemoUser', 'getUserProfile', 'logout'])},
        { provide: RootScopeShareService, useValue: jasmine.createSpyObj('RootScopeShareService', ['getData'])},
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DataApiService, useValue: jasmine.createSpyObj('DataApiService', ['genericMethod']) },
        { provide: SocketService, useValue: jasmine.createSpyObj('SocketService', ['initSocket', 'onModel']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLayoutComponent);
    component = fixture.componentInstance;
    authSpy = TestBed.get(AuthService);
    authSpy.getUserProfile.and.returnValue(testProfile);
    dataSvcSpy = TestBed.get(RootScopeShareService);
    dataSvcSpy.getData.and.returnValue(testTenant);
    apiSpy = TestBed.get(DataApiService);
    apiSpy.genericMethod.withArgs('Message', 'countUnread').and.returnValue(of(0));
    apiSpy.genericMethod.withArgs('EndUser', 'getMyUser', [testProfile.authId]).and.returnValue(of({ id: 1000 }));
    socketSpy = TestBed.get(SocketService);
    socketSpy.onModel.and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get Company Info', () => {
    expect(component.getCompanyLogo()).toEqual(AWS_S3_PUBLIC_URL + testTenant.id + '/favicon.png', 'expect tenant logo URL');
    expect(component.getCompanyName()).toEqual(testTenant.companyName, 'expect tenant name');
  });
});
