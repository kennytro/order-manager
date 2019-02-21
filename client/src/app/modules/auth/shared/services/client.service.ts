import { Injectable } from '@angular/core';

import { BASE_URL, API_VERSION } from '../../../../shared/base.url';
import { LoopBackConfig } from '../../../../shared/sdk/index';
import { Client } from '../../../../shared/sdk/models';
import { ClientApi } from '../../../../shared/sdk/services';

@Injectable()
export class ClientService {

  constructor(private _clientApi: ClientApi) {
    LoopBackConfig.setBaseURL(BASE_URL);
    LoopBackConfig.setApiVersion(API_VERSION);    
  }

  async save(client: Client) {
    console.log(`Saving clinet(name: ${client.name}...`);
    try {
      return await this._clientApi.upsert(client).toPromise();
    } catch (err) {
      console.log(`error: failed to save client(name: ${client.name}) - ${err.message}`);
      throw err;
    }
  }
}
