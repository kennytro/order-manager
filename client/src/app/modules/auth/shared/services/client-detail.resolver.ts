import { Injectable }             from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { BASE_URL, API_VERSION } from '../../../../shared/base.url';
import { LoopBackConfig } from '../../../../shared/sdk/index';
import { Client } from '../../../../shared/sdk/models';
import { ClientApi } from '../../../../shared/sdk/services';

@Injectable()
export class ClientDetailResolver implements Resolve<Client> {
  constructor(private _clientApi: ClientApi) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }

  async resolve(route: ActivatedRouteSnapshot) {
    try {
      const clientId = route.paramMap.get('id');
      return await this._clientApi.findById<Client>(clientId).toPromise();
    } catch (err) {
      console.log('error: ' + err.message);
      return null;
    }
  }
}