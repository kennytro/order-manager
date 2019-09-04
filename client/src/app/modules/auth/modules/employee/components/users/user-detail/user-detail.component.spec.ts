import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faLongArrowAltLeft } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { AlertService } from '../../../../../shared/services/alert.service';
import { DataApiService } from '../../../services/data-api.service';
import { AuthService, UserProfile } from '../../../../../../../services/auth.service';
import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let authSvcSpy: jasmine.SpyObj<AuthService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let snackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let alertSpy: jasmine.SpyObj<AlertService>;
  library.add(faUser, faLongArrowAltLeft);

  beforeEach(async(() => {
    const testUser = {
      id: 'kenny', email: 'kenny@etr.com', role: 'customer',
      clientId: '111', createDate: '01/01/2019', authId: 'ABCD'
    };
    const testUserProfile: UserProfile = { email: 'kenny@etr.com', authId: 'AAAA', clientId: '111', pictureUrl: 'URL' };
    const testClients = [
      { id: '111', name: 'testA' },
      { id: '112', name: 'testB' }
    ];

    const route = ({ data: of({ user: testUser, clients: testClients } ), snapshot: {} } as any) as ActivatedRoute;
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserProfile']);
    authSpy.getUserProfile.and.returnValue(testUserProfile);
    const msbSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dataSpy = jasmine.createSpyObj('DataApiService', ['genericMethod', 'destroyById']);
    const asSpy = jasmine.createSpyObj('AlertService', ['confirm', 'alertSuccess']);

    TestBed.configureTestingModule({
      declarations: [ UserDetailComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],      
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: route },
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: msbSpy },
        { provide: DataApiService, useValue: dataSpy },
        { provide: AlertService, useValue: asSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // TO DO: test save() and delete()
});
