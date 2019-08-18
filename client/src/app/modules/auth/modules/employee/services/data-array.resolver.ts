import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import { DataApiService } from './data-api.service';

@Injectable()
export class DataArrayResolver implements Resolve<Array<any>> {
  constructor(
    private _dataService: DataApiService
  ) {
  }

  async resolve(route: ActivatedRouteSnapshot) {
    let modelName = route.data['arrayModelName'];
    if (modelName === 'Message') {
      return await this._dataService.genericMethod(modelName, 'getMessages').toPromise();
    }
    return await this._dataService.find(modelName, route.data['arrayFilter']).toPromise();
  }
}
