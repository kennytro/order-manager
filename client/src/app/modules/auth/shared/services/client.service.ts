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

  async getClientList(filterOverride?: object) {
    try {
      let filter = filterOverride ? filterOverride : {
        fields: { id: true, name: true, phone: true, deliveryRouteId: true, createdDate: true }
      }
      return await this._clientApi.find<Client>(filter).toPromise();
    } catch (err) {
      return [];
    }
  }
}
