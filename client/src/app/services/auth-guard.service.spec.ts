import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthGuardService } from './auth-guard.service';

describe('AuthGuardService', () => {
  let authGuard: AuthGuardService;
  let authSvcSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });
    authGuard = TestBed.get(AuthGuardService);
    authSvcSpy = TestBed.get(AuthService);
    routerSpy = TestBed.get(Router);
  });

  it('should be created', () => {
    //const service: AuthGuardService = TestBed.get(AuthGuardService);
    expect(authGuard).toBeTruthy();
  });
  it('should navigate to \'login\' page', () => {
    authSvcSpy.isAuthenticated.and.returnValue(false);
    expect(authGuard.canLoad(null)).toBe(false, 'guard returned false');
    expect(routerSpy.navigate.calls.count()).toBe(1, 'spy method was called once');
  });
  it('should not navigate to \'login\' page', () => {
    authSvcSpy.isAuthenticated.and.returnValue(true);
    expect(authGuard.canLoad(null)).toBe(true, 'guard returned true');
    expect(routerSpy.navigate.calls.count()).toBe(0, 'spy method was not called');
  });
});
