import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { LocalScopeShareService } from './local-scope-share.service';
import { ContentService } from './content.service';

export interface LocationInfo {
  company: any,
  clients: any[]
}

@Injectable()
export class ClientResolver extends ContentService implements Resolve<string> {
  constructor(http: HttpClient, dataShare: LocalScopeShareService) {
    super(http, dataShare);
  }

  resolve() {
    return this.getContent('client');
  }

  getLocations() {
    return this.http.get<LocationInfo>('/public/clients');
  }
}