import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';
import { AuthService } from '../../../../../services/auth.service';

import get from 'lodash/get';

@Injectable()
export class OrderResolver implements Resolve<any> {
  constructor(
    private _auth: AuthService,
    private _dataService: DataApiService
  ) {
  }

  async resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get('id');
    if (id) {
      try {
        let [order, products, currentUser] = await Promise.all([
          this._dataService.findById('Order', id,
            { include: [
              { relation: 'orderItem' },
              { 
                relation: 'client',
                scope: {
                  fields: ['id', 'name', 'feeSchedule', 'feeType', 'feeValue']
                }
              },
              { 
                relation: 'userCreated',
                scope: {
                  fields: ['id', 'email']
                }
              },
              { 
                relation: 'userUpdated',
                scope: {
                  fields: ['id', 'email']
                }
              }
            ] }).toPromise(),
          this._dataService.find('Product').toPromise(),
          this._dataService.genericMethod('EndUser', 'getMyUser', [this._auth.getUserProfile().authId]).toPromise()
        ]);
        return {
          order: order,
          products: products,
          productExclusionList: get(currentUser, ['userSettings', 'productExcluded'], [])
        };
      } catch (err) {
        console.error(`Errro while resolving order data - ${err.message}`);
        throw err;
      }
    }
    console.error(`Data resolver requires 'modelName' and 'id'`);
  }
}
