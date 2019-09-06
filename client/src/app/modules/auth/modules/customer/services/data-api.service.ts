import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, EMPTY } from 'rxjs';
import { BASE_URL, API_VERSION } from '../../../../../shared/base.url';
import { LoopBackConfig } from '../../../../../shared/sdk/index';
import { CustomerDataApi } from '../../../../../shared/sdk/services';

@Injectable()
export class DataApiService {
  constructor(
    private _cookieService: CookieService,
    private _dataApi: CustomerDataApi
  ) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }

  find(modelName: string, filter: object = {}): Observable<any> {
    return this._dataApi.genericFind(modelName, filter);
  }

  findById(modelName: string, id: string, filter:object = {}): Observable<any> {
    return this._dataApi.genericFindById(modelName, id, filter);
  }

  upsert(modelName: string, modelObj: object): Observable<any> {
    return this._dataApi.genericUpsert(modelName, modelObj);
  }

  destroyById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericDestroyById(modelName, id);
  }

  genericMethod(modelName: string, methodName: string, param?: Array<any>): Observable<any> {
    // Client method requires current user's client id as the first argument.
    if (modelName == 'Client') {
      if (param) {
        param = [parseInt(this._cookieService.get('clientId'))].concat(param);
      } else {
        param = [parseInt(this._cookieService.get('clientId'))];
      }
    }
    return this._dataApi.genericMethod(modelName, methodName, param || []);
  }
}
