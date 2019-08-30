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
    return this._dataApi.genericFind(modelName, filter);
  }

  findById(modelName: string, id: string, filter: object = {}): Observable<any> {
    return this._dataApi.genericFindById(modelName, id, filter);
  }

  upsert(modelName: string, modelObj: object): Observable<any> {
    return this._dataApi.genericUpsert(modelName, modelObj);
  }

  destroyById(modelName: string, id: string): Observable<any> {
    return this._dataApi.genericDestroyById(modelName, id);
  }

  genericMethod(modelName: string, methodName: string, param?: Array<any>): Observable<any> {
    return this._dataApi.genericMethod(modelName, methodName, param || []);
  }

  /*
   * This code is commented out because of response type not a json issue(See pdf.service.ts for detail)
  genericGetFile(modelName: string, methodName: string, param?: Array<any>): Observable<any> {
    return this._dataApi.genericGetFile(modelName, methodName, param || []);
  }
  */
}
