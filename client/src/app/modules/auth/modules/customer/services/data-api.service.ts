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
    return this._dataApi.genericFind(this._getIdToken(),
      modelName, filter);
  }

  findById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericFindById(this._getIdToken(),
      modelName, id);
  }

  upsert(modelName: string, modelObj: object): Observable<any> {
    return this._dataApi.genericUpsert(this._getIdToken(),
      modelName, modelObj);
  }

  destroyById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericDestroyById(this._getIdToken(),
      modelName, id);
  }

  genericMethod(methodName: string, param?: Array<any>): Observable<any> {
    let newParams = param ? [this._getIdToken(), ...param] : [this._getIdToken()];
    return this._dataApi[methodName](...newParams);
  }

  private _getIdToken() {
    return this._cookieService.get('idToken');
  }
}
