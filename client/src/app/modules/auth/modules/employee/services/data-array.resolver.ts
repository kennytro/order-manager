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
    return await this._dataService.find(route.data['arrayModelName']).toPromise();
  }
}
