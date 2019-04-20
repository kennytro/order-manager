import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';

@Injectable()
export class StatementResolver implements Resolve<any> {
  constructor(private _dataService: DataApiService) { }

  async resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get('id');
    if (id) {
      try {
        const statementFilter = {
          include: [
            {
              relation: 'order',
              scope: {
                include: {
                  relation: 'orderItem'
                }
              }
            },
            { 
              relation: 'client',
              scope: {
                fields: ['id', 'name']
              }
            },
            { 
              relation: 'userCreated',
              scope: {
                fields: ['id', 'email']
              }
            }
          ]          
        };
        let [statementInfo, products] = await Promise.all([
          this._dataService.genericMethod('Statement', 'findByIdDetail', [id, statementFilter]).toPromise(),
          this._dataService.find('Product').toPromise()
        ]);
        statementInfo.products = products;
        return statementInfo;
      } catch (err) {
        console.error(`Errro while resolving statement data - ${err.message}`);
        throw err;
      }
    }
    console.error(`Statement resolver requires 'id'`);    
  }
}
