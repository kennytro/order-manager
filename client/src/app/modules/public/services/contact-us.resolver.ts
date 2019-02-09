import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { LocalScopeShareService } from './local-scope-share.service';
import { ContentService } from './content.service';

@Injectable()
export class ContactUsResolver extends ContentService implements Resolve<string> {
  constructor(http: HttpClient, dataShare: LocalScopeShareService) {
    super(http, dataShare);
  }

  resolve() {
    return this.getContent('contact us');
  }
}