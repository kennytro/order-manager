import { TestBed } from '@angular/core/testing';

import { LocalScopeShareService } from './local-scope-share.service';

describe('LocalScopeShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalScopeShareService = TestBed.get(LocalScopeShareService);
    expect(service).toBeTruthy();
  });
});
