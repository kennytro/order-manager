import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { BASE_URL, API_VERSION } from '../../../../../shared/base.url';
import { LoopBackConfig } from '../../../../../shared/sdk/index';
import { DeliveryRoute } from '../../../../../shared/sdk/models';
import { DeliveryRouteApi } from '../../../../../shared/sdk/services';

@Injectable()
export class DeliveryRoutesResolver implements Resolve<DeliveryRoute[]> {
  constructor(private _routeApi: DeliveryRouteApi) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }
  async resolve() {
    try {
      return await this._routeApi.find<DeliveryRoute>().toPromise();
    } catch (err) {
      console.log('error: ' + err.message);
      return [];
    }
  }
}
