import { TestBed } from '@angular/core/testing';
import { Router, Route } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../../services/auth.service';
import { RootScopeShareService } from '../../../services/root-scope-share.service';

import { RoleGuardService } from './role-guard.service';

describe('RoleGuardService', () => {
  let roleGuard: RoleGuardService;
  let authSvcSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dsSvcSpy: jasmine.SpyObj<RootScopeShareService>;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dsSpy = jasmine.createSpyObj('RootScopeShareService', ['getData']);
    const csSpy = jasmine.createSpyObj('CookieService', ['set', 'delete', 'get', 'check']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuardService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy },
        { provide: RootScopeShareService, useValue: dsSpy },
        { provide: CookieService, useValue: csSpy }
      ]
    });
    roleGuard = TestBed.get(RoleGuardService);
    authSvcSpy = TestBed.get(AuthService);
    routerSpy = TestBed.get(Router);
    dsSvcSpy = TestBed.get(RootScopeShareService);
    cookieSpy = TestBed.get(CookieService);
  });

  it('should be created', () => {
    expect(roleGuard).toBeTruthy();
  });
  it('should activate', () => {
    authSvcSpy.isAuthenticated.and.returnValue(true);
    cookieSpy.check.and.returnValue(true);
    cookieSpy.get.and.returnValues('["customer"]', '["manager"]', '["admin"]');
    expect(roleGuard.canActivate()).toBe(true, 'customer activated');
    expect(roleGuard.canActivate()).toBe(true, 'manager activated');
    expect(roleGuard.canActivate()).toBe(true, 'admin activated');
  });
  it('should not activate', () => {
    authSvcSpy.isAuthenticated.and.returnValues(false, true);
    expect(roleGuard.canActivate()).toBe(false, 'returned false when not authenticated');
    expect(routerSpy.navigate.calls.count()).toBe(1, 'naviated to login page');

    cookieSpy.check.and.returnValues(false, true);
    routerSpy.navigate.calls.reset();
    expect(roleGuard.canActivate()).toBe(false, 'returned false with missing roles');
    expect(routerSpy.navigate.calls.count()).toBe(1, 'naviated to login page');

    routerSpy.navigate.calls.reset();
    cookieSpy.get.and.returnValue('["test"]');
    expect(roleGuard.canActivate()).toBe(false, 'returned false with invalid role');
    expect(routerSpy.navigate.calls.count()).toBe(1, 'naviated to login page');
  });
  it('should activate child', () => {
    authSvcSpy.isAuthenticated.and.returnValue(true);
    cookieSpy.check.and.returnValue(true);
    cookieSpy.get.and.returnValue('["customer"]');
    expect(roleGuard.canActivateChild()).toBe(true, 'customer activated child');
  });
  it('should not activate child', () => {
    authSvcSpy.isAuthenticated.and.returnValue(false);
    expect(roleGuard.canActivateChild()).toBe(false, 'not activated child when not authenticated');
  });
  it('should load', () => {
    authSvcSpy.isAuthenticated.and.returnValue(true);
    cookieSpy.check.and.returnValue(true);
    cookieSpy.get.and.returnValue('["customer"]');
    expect(roleGuard.canLoad({ path: 'customer' })).toBe(true, 'customer loaded');
    cookieSpy.get.and.returnValue('["manager"]');
    expect(roleGuard.canLoad({ path: 'employee' })).toBe(true, 'manager loaded');
    cookieSpy.get.and.returnValue('["admin"]');
    expect(roleGuard.canLoad({ path: 'employee' })).toBe(true, 'admin loaded');
  });
  it('should not load', () => {
    authSvcSpy.isAuthenticated.and.returnValue(true);
    cookieSpy.check.and.returnValue(true);
    cookieSpy.get.and.returnValue('["customer"]');
    expect(roleGuard.canLoad({ path: 'employee' })).toBe(false, 'customer can not load employee module');
    cookieSpy.get.and.returnValue('["admin"]');
    expect(roleGuard.canLoad({ path: 'customer' })).toBe(false, 'admin can not load customer module');
  });
});
