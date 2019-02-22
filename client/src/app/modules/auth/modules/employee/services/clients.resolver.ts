import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { Client } from '../../../../../shared/sdk/models';
import { ClientService } from '../../../shared/services/client.service'


@Injectable()
export class ClientsResolver implements Resolve<Client[]> {
  constructor(private _clientSvc: ClientService) {
  }

  async resolve() {
    return await this._clientSvc.getClientList();
  }
}
