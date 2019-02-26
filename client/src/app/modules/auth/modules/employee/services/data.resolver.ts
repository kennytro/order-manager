import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";
import { DataApiService } from './data-api.service';

@Injectable()
export class DataResolver implements Resolve<any> {
  constructor(
    private _dataService: DataApiService
  ) {
  }

  async resolve(route: ActivatedRouteSnapshot) {
    return await this._dataService.findById(route.data['modelName'], route.paramMap.get('id')).toPromise();
  }
}
