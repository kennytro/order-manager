import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';

import { DataApiService } from './data-api.service';
import { EmployeeDataApi } from '../../../../../shared/sdk/services';
import { asyncData, asyncError } from '../../../../../../testing/async-observable-helpers';

describe('DataApiService', () => {
  let service: DataApiService;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  let apiSpy: jasmine.SpyObj<EmployeeDataApi>;
  beforeEach(() => {
    const csSpy = jasmine.createSpyObj('CookieService', ['get']);
    const aSpy = jasmine.createSpyObj('EmployeeDataApi',
      ['genericFind', 'genericFindById', 'genericUpsert', 'genericDestroyById', 'genericMethod']);
    TestBed.configureTestingModule({
      providers: [
        DataApiService,
        { provide: CookieService, useValue: csSpy },
        { provide: EmployeeDataApi, useValue: aSpy }
      ]      
    });
    service = TestBed.get(DataApiService);
    cookieSpy = TestBed.get(CookieService);
    apiSpy = TestBed.get(EmployeeDataApi);    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should call APIs', () => {
    cookieSpy.get.and.returnValue('testToken');
    apiSpy.genericFind.and.returnValue(asyncData({id: 'test'}));
    service.find('ModelName', {property: 'test'}).subscribe(
      response => expect(apiSpy.genericFind.calls.count()).toBe(1, 'called genericFind()'),
      fail
    );
    apiSpy.genericFindById.and.returnValue(asyncData({id: 'test'}));
    service.findById('ModelName', 'testId', {property: 'test'}).subscribe(
      response => expect(apiSpy.genericFindById.calls.count()).toBe(1, 'called genericFindById()'),
      fail
    );
    apiSpy.genericUpsert.and.returnValue(asyncData({id: 'test'}));
    service.upsert('ModelName', {property: 'test'}).subscribe(
      response => expect(apiSpy.genericUpsert.calls.count()).toBe(1, 'called genericUpsert()'),
      fail
    );
    apiSpy.genericDestroyById.and.returnValue(asyncData({id: 'test'}));
    service.destroyById('ModelName', 'testId').subscribe(
      response => expect(apiSpy.genericDestroyById.calls.count()).toBe(1, 'called genericDestroyById()'),
      fail
    );
    apiSpy.genericMethod.and.returnValue(asyncData({id: 'test'}));
    service.genericMethod('ModelName', 'MethodName').subscribe(
      response => expect(apiSpy.genericMethod.calls.count()).toBe(1, 'called genericMethod()'),
      fail
    );
  });
});
