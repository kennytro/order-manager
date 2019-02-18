import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { BASE_URL, API_VERSION } from '../../../../../shared/base.url';
import { LoopBackConfig } from '../../../../../shared/sdk/index';
import { Client } from '../../../../../shared/sdk/models';
import { ClientApi } from '../../../../../shared/sdk/services';

@Injectable()
export class ClientsResolver implements Resolve<Client[]> {
  constructor(private _clientApi: ClientApi) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }

  async resolve() {
    try {
      let filter = {
        fields: { id: true, name: true, createdDate: true }
      }
      return await this._clientApi.find<Client>(filter).toPromise();
    } catch (err) {
      console.log('error: ' + err.message);
    }
  }
}
