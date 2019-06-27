import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ContentService } from './content.service';
import { LocalScopeShareService } from './local-scope-share.service';
import { asyncData, asyncError } from '../../../../testing/async-observable-helpers';

describe('ContentService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;  
  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ContentService,
        { provide: HttpClient, useValue: httpSpy },
        LocalScopeShareService
      ]
    });
    httpClientSpy = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    const service: ContentService = TestBed.get(ContentService);
    expect(service).toBeTruthy();
  });
  it('should get content', async () => {
    const service: ContentService = TestBed.get(ContentService);
    httpClientSpy.get.and.returnValue(asyncData({html: '<h1>TEST</h1>'})); 
    const content = await service.getContent('test');
    expect(content).toEqual('<h1>TEST</h1>', 'content to be "<h1>TEST</h1>"');
    expect(httpClientSpy.get.calls.count()).toBe(1, 'spy get method called once');
  });
  it('should cache content', async () => {
    const service: ContentService = TestBed.get(ContentService);
    httpClientSpy.get.and.returnValue(asyncData({html: '<h1>TEST</h1>'})); 
    let content = await service.getContent('test');
    content = await service.getContent('test');
    expect(content).toEqual('<h1>TEST</h1>', 'content to be "<h1>TEST</h1>"');
    expect(httpClientSpy.get.calls.count()).toBe(1, 'spy get method called once');
  });
});
