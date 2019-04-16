import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';
import get from 'lodash/get';

@Injectable()
export class StatementsResolver implements Resolve<any> {
  constructor(private _dataService: DataApiService) { }

  async resolve(route: ActivatedRouteSnapshot) {
    const filter = route.data['filter'] || {};
    return await this._dataService.find('Statement', filter).toPromise();
  }
}
