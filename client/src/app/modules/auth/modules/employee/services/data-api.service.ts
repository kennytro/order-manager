import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, EMPTY } from 'rxjs';
import { BASE_URL, API_VERSION } from '../../../../../shared/base.url';
import { LoopBackConfig } from '../../../../../shared/sdk/index';
import { EmployeeDataApi } from '../../../../../shared/sdk/services';

@Injectable()
export class DataApiService {

  constructor(
    private _cookieService: CookieService,
    private _dataApi: EmployeeDataApi
  ) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }

  find(modelName: string, filter: object = {}): Observable<any> {
    return this._dataApi.genericFind(this._cookieService.get('idToken'),
      modelName, filter);
  }

  findById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericFindById(this._cookieService.get('idToken'),
      modelName, id);
  }

  upsert(modelName: string, modelObj: object): Observable<any> {
    return this._dataApi.genericUpsert(this._cookieService.get('idToken'),
      modelName, modelObj);
  }

  destroyById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericDestroyById(this._cookieService.get('idToken'),
      modelName, id);
  }
}
