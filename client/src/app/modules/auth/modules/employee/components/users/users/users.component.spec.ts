import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';
import { UsersComponent } from './users.component';
import { UserLogsComponent } from './user-logs/user-logs.component';

import { AuthService } from '../../../../../../../services/auth.service';
import { DataApiService } from '../../../services/data-api.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authSvcSpy: jasmine.SpyObj<AuthService>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  let snackbarSpy: jasmine.SpyObj<MatSnackBar>;
  library.add(faUserPlus);

  beforeEach(async(() => {
    const testUsers = [
      { id: 'kenny', email: 'kenny@etr.com', role: 'customer', clientId: '111', createDate: '01/01/2019'}
    ];
    const route = ({ data: of({ users: testUsers} ), snapshot: {} } as any) as ActivatedRoute;
    const mdSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isDemoUser']);
    const dataSpy = jasmine.createSpyObj('DataApiService', ['find']);
    const msbSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [ UsersComponent, UserLogsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: mdSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: DataApiService, useValue: dataSpy },
        { provide: MatSnackBar, useValue: msbSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    dialogSpy = TestBed.get(MatDialog);
    authSvcSpy = TestBed.get(AuthService);
    apiSpy = TestBed.get(DataApiService);
    snackbarSpy = TestBed.get(MatSnackBar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should count users', () => {
    expect(component.getUsersCount()).toEqual(1, 'returned length of testUsers.');
  });
});
