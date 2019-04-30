import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';
import { AuthService } from '../../../../../services/auth.service';
import { environment } from '../../../../../../environments/environment';
import get from 'lodash/get';

@Injectable()
export class DataResolver implements Resolve<any> {
  private _jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private _auth: AuthService,
    private _cookieService: CookieService,
    private _dataService: DataApiService
  ) {
  }

  async resolve(route: ActivatedRouteSnapshot) {
    const modelName = route.data['modelName'];
    const filter = route.data['filter'] || {};
    let id = route.paramMap.get('id');
    if (!id) {
      if (modelName == 'EndUser') {
         return await this._dataService.genericMethod(modelName, 'getMyUser', [this._auth.getUserProfile().authId]).toPromise();
      }
      if (modelName == 'Client') {
        // const tokenPayload = this._jwtHelper.decodeToken(this._cookieService.get('idToken'));
        // id = get(tokenPayload, [environment.auth0Namespace + 'app_metadata', 'clientId']);
        id = this._cookieService.get('clientId');
        return await this._dataService.genericMethod(modelName, 'getMyClient', [parseInt(id)]).toPromise();

      }
    }
    if (id && modelName) {
      return await this._dataService.findById(modelName, id, filter).toPromise();
    }
    console.error(`Data resolver requires 'modelName' and 'id'`);
  }
}
