import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { RootScopeShareService } from './root-scope-share.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    const documentSpy = jasmine.createSpyObj('Document', ['location']);
    const dsSpy = jasmine.createSpyObj('RootScopeShareService', ['getData']);
    const routerSpy = jasmine.createSpyObj('Router', ['events', 'navigate']);
    const csSpy = jasmine.createSpyObj('CookieService', ['set', 'delete', 'get', 'check']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Document, useValue: documentSpy },
        { provide: RootScopeShareService, useValue: dsSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CookieService, useValue: csSpy }
      ]
    });
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});
