import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../shared/auth-shared.module';
import { AWS_S3_PUBLIC_URL } from '../../../../../../shared/base.url';
import { CustomerLayoutComponent } from './customer-layout.component';
import { AuthService, UserProfile } from '../../../../../../services/auth.service';
import { RootScopeShareService } from '../../../../../../services/root-scope-share.service';

import { DataApiService } from '../../services/data-api.service';
import { SocketService } from '../../../../shared/services/socket.service';

describe('CustomerLayoutComponent', () => {
  const testClient = { id: '1000', name: 'testA', phone: '1111111111', deliveryRouteId: 'routeA', createdDate: '1/1/2019' };
  const testTenant = { id: 'om-app-dev', companyName: 'test' };
  const testProfile = { email: 'kenny@etr.com', authId: 'AAAAAA', clientId: '1000', pictureUrl: '' };
  let component: CustomerLayoutComponent;
  let fixture: ComponentFixture<CustomerLayoutComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let rootDataSpy: jasmine.SpyObj<RootScopeShareService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let socketSpy: jasmine.SpyObj<SocketService>;

  beforeEach(async(() => {
    const route = ({ data: of({ client: testClient } ), snapshot: {} } as any) as ActivatedRoute;
    TestBed.configureTestingModule({
      declarations: [ CustomerLayoutComponent ],
      imports: [ NoopAnimationsModule, RouterTestingModule, AuthSharedModule ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
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
    fixture = TestBed.createComponent(CustomerLayoutComponent);
    component = fixture.componentInstance;
    authSpy = TestBed.get(AuthService);
    authSpy.getUserProfile.and.returnValue(testProfile);
    rootDataSpy = TestBed.get(RootScopeShareService);
    rootDataSpy.getData.and.returnValue(testTenant);
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
    expect(component.getStoreName()).toEqual(testClient.name, 'expect client name');
  });
});
