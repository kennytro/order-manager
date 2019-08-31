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
import { CustomerData } from '../../models/CustomerData';


/**
 * Api services for the `CustomerData` model.
 */
@Injectable()
export class CustomerDataApi extends BaseLoopBackApi {

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
   * @param {string} modelName 
   *
   * @param {object} filter 
   *
   * @param {string} accessToken 
   *
   * @returns {object[]} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CustomerData` object.)
   * </em>
   */
  public genericFind(modelName: any, filter: LoopBackFilter = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "GET";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/CustomerData/find";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
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
   * @param {string} modelName 
   *
   * @param {string} id 
   *
   * @param {object} filter 
   *
   * @param {string} accessToken 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `CustomerData` object.)
   * </em>
   */
  public genericFindById(modelName: any, id: any, filter: LoopBackFilter = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "GET";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/CustomerData/findById/:id";
    let _routeParams: any = {
      id: id
    };
    let _postBody: any = {};
    let _urlParams: any = {};
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
   * This usually means the response is a `CustomerData` object.)
   * </em>
   */
  public genericUpsert(modelName: any, modelObj: any, customHeaders?: Function): Observable<any> {
    let _method: string = "PUT";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/CustomerData/upsert";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
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
   * @param {string} modelName 
   *
   * @param {string} id 
   *
   * @param {string} accessToken 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public genericDestroyById(modelName: any, id: any, customHeaders?: Function): Observable<any> {
    let _method: string = "DELETE";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/CustomerData/delete/:id";
    let _routeParams: any = {
      id: id
    };
    let _postBody: any = {};
    let _urlParams: any = {};
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
   * This usually means the response is a `CustomerData` object.)
   * </em>
   */
  public genericMethod(modelName: any, methodName: any, params: any = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "POST";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/CustomerData/method";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof modelName !== 'undefined' && modelName !== null) _urlParams.modelName = modelName;
    if (typeof methodName !== 'undefined' && methodName !== null) _urlParams.methodName = methodName;
    if (typeof params !== 'undefined' && params !== null) _urlParams.params = params;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `CustomerData`.
   */
  public getModelName() {
    return "CustomerData";
  }
}
