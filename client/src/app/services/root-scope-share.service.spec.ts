import { TestBed } from '@angular/core/testing';

import { RootScopeShareService } from './root-scope-share.service';

describe('RootScopeShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RootScopeShareService = TestBed.get(RootScopeShareService);
    expect(service).toBeTruthy();
  });
});
