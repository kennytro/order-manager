import { Injectable } from '@angular/core';
import { LazyMapsAPILoaderConfigLiteral } from '@agm/core';
import { HttpClient } from '@angular/common/http';

/**
 * This class allows lazy setting Google map API key to AgmCoreModule. The key
 * is provided through 'tenant' object from back-end server which is fetched 
 * after application is loaded. When auth module is loaded(e.i. user signs in),
 * this class sets the key to AgmCoreModule via 'LAZY_MAPS_API_CONFIG'(see
 * employee.module.ts for example)
 */
@Injectable()
export class AgmConfig implements LazyMapsAPILoaderConfigLiteral {
  public apiKey: string;

  constructor(private _http: HttpClient) {
    this._http.get('/tenant')
      .subscribe(tenant => {
        this.apiKey = tenant['mapAPIKey'];
        console.log('set map api key.');
      });
 }
}
