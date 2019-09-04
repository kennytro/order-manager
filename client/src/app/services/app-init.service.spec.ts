import { TestBed } from '@angular/core/testing';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppInitService } from './app-init.service';
import { RootScopeShareService } from './root-scope-share.service';

import { asyncData, asyncError } from '../../testing/async-observable-helpers';

describe('AppInitService', () => {
  let shareSvcSpy: jasmine.SpyObj<RootScopeShareService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    const shareSpy = jasmine.createSpyObj('RootScopeShareService', ['setData']);
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: RootScopeShareService, useValue: shareSpy }
      ]
    });
    shareSvcSpy = TestBed.get(RootScopeShareService);
    httpClientSpy = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    const service: AppInitService = TestBed.get(AppInitService);
    expect(service).toBeTruthy();
  });
  it('should be initialized', async () => {
    httpClientSpy.get.and.returnValue(asyncData({id: 'test'}));
    shareSvcSpy.setData.and.callFake(function() {});
    const service: AppInitService = TestBed.get(AppInitService);
    await service.init();
    expect(httpClientSpy.get.calls.count()).toBe(1, 'spy get method called once');
    expect(shareSvcSpy.setData.calls.count()).toBe(1, 'spy setData method called once');
  });
});
