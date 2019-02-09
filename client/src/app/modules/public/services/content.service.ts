import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LocalScopeShareService } from './local-scope-share.service';

@Injectable()
export class ContentService {

  constructor(private http: HttpClient, private dataShare: LocalScopeShareService) { }

  async getContent(name: string) {
    let content = this.dataShare.getData(name);
    if (!content) {
      try {
        content = await this.http.get('/public/' + name, { responseType: 'text'}).toPromise();        
        this.dataShare.setData(name, content);
      } catch (err) {
        console.log(`Error while getting "/public/${name}": ${err.message}`);
        content = `${name} data is not available at this time.`;
      }
    }
    return content;
  }
}
