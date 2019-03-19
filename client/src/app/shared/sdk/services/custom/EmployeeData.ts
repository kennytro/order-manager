/* tslint:disable */
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SDKModels } from './SDKModels';
import { BaseLoopBackApi } from '../core/base.service';
import { LoopBackConfig } from '../../lb.config';
import { LoopBackAuth } from '../core/auth.service';
import { LoopBackFilter,  } from '../../models/BaseModels';
import { ErrorHandler } from '../core/error.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmployeeData } from '../../models/EmployeeData';


/**
 * Api services for the `EmployeeData` model.
 */
@Injectable()
export class EmployeeDataApi extends BaseLoopBackApi {

  constructor(
    @Inject(HttpClient) protected http: HttpClient,
    @Inject(SDKModels) protected models: SDKModels,
    @Inject(LoopBackAuth) protected auth: LoopBackAuth,
    @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
  ) {
    super(http,  models, auth, errorHandler);
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {string} idToken 
   *
   * @param {string} modelName 
   *
   * @param {object} filter 
   *
   * @returns {object[]} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `EmployeeData` object.)
   * </em>
   */
  public genericFind(idToken: any, modelName: any, filter: LoopBackFilter = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "GET";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/find";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    if (typeof filter !== 'undefined' && filter !== null) _urlParams.filter = filter;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {string} idToken 
   *
   * @param {string} modelName 
   *
   * @param {string} id 
   *
   * @param {object} filter 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `EmployeeData` object.)
   * </em>
   */
  public genericFindById(idToken: any, modelName: any, id: any, filter: LoopBackFilter = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "GET";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/findById/:id";
    let _routeParams: any = {
      id: id
    };
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    if (typeof filter !== 'undefined' && filter !== null) _urlParams.filter = filter;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {object} data Request data.
   *
   *  - `idToken` – `{string}` - 
   *
   *  - `modelName` – `{string}` - 
   *
   *  - `modelObj` – `{object}` - 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `EmployeeData` object.)
   * </em>
   */
  public genericUpsert(idToken: any, modelName: any, modelObj: any, customHeaders?: Function): Observable<any> {
    let _method: string = "PUT";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/upsert";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    if (typeof modelObj !== 'undefined' && modelObj !== null) _urlParams.modelObj = modelObj;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {string} idToken 
   *
   * @param {string} modelName 
   *
   * @param {string} id 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public genericDestroyById(idToken: any, modelName: any, id: any, customHeaders?: Function): Observable<any> {
    let _method: string = "DELETE";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/delete/:id";
    let _routeParams: any = {
      id: id
    };
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {object} data Request data.
   *
   *  - `idToken` – `{string}` - 
   *
   *  - `modelName` – `{string}` - 
   *
   *  - `methodName` – `{string}` - 
   *
   *  - `params` – `{any}` - 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `EmployeeData` object.)
   * </em>
   */
  public genericMethod(idToken: any, modelName: any, methodName: any, params: any = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "POST";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/method";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    if (typeof methodName !== 'undefined' && methodName !== null) _urlParams.methodName = methodName;
    if (typeof params !== 'undefined' && params !== null) _urlParams.params = params;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * <em>
         * (The remote method definition does not provide any description.)
         * </em>
   *
   * @param {object} data Request data.
   *
   *  - `idToken` – `{string}` - 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public resetPassword(idToken: any, customHeaders?: Function): Observable<any> {
    let _method: string = "POST";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/EmployeeData/resetPassword";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof idToken !== 'undefined' && idToken !== null) _urlParams.idToken = idToken;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `EmployeeData`.
   */
  public getModelName() {
    return "EmployeeData";
  }
}
