import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RootScopeShareService } from './root-scope-share.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(private http: HttpClient,  private dataShare: RootScopeShareService) { }

  /* Before AppComponent is instantiated, this service runs via APP_INITIALIZER
   * to retrieve tenant configuration from the back end. Tenant setting provides
   * tenant specific settings such as AWS S3 URL, Auth0 client id, etc.
   */
  async init() {
    // Get tenant configuration from API server.
    // console.log('Getting tenant configuration...');
    let tenant = await this.http.get('/tenant').toPromise();
    this.dataShare.setData('tenant', tenant);
    // console.log('Saved tenant configuration.')
  }
}
