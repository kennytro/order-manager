import { TestBed } from '@angular/core/testing';

import { LocalScopeShareService } from './local-scope-share.service';

describe('LocalScopeShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [LocalScopeShareService]
  }));

  it('should be created', () => {
    const service: LocalScopeShareService = TestBed.get(LocalScopeShareService);
    expect(service).toBeTruthy();
  });
  it('should set data', () => {
    const service: LocalScopeShareService = TestBed.get(LocalScopeShareService);
    service.setData('testKey', 'testVal');
    expect(service.getData('testKey')).toEqual('testVal', 'expected getData() to return testVal');
  });
  it('should remove data', () => {
    const service: LocalScopeShareService = TestBed.get(LocalScopeShareService);
    service.setData('testKey', 'testVal');
    service.removeData('testKey');
    expect(service.getData('testKey')).toEqual(undefined, 'expected getData() to return undefined');
  });
});
