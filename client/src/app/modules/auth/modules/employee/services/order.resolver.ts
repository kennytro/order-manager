import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';

@Injectable()
export class OrderResolver implements Resolve<any> {
  constructor(private _dataService: DataApiService) { }

  async resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get('id');
    if (id) {
      try {
        let [order, products] = await Promise.all([
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
          this._dataService.find('Product').toPromise()
        ]);
        return {
          order: order,
          products: products
        };
      } catch (err) {
        console.error(`Errro while resolving order data - ${err.message}`);
        throw err;
      }
    }
    console.error(`Order resolver requires 'id'`);
  }
}
