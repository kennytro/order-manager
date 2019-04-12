import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { DataApiService } from './data-api.service';
import { AuthService } from '../../../../../services/auth.service';

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
    let id = route.paramMap.get('id');
    if (!id) {
      if (modelName == 'EndUser') {
         return await this._dataService.genericMethod(modelName, 'getMyUser', [this._auth.getUserProfile().authId]).toPromise();
      }
      if (modelName == 'Client') {
        const tokenPayload = this._jwtHelper.decodeToken(this._cookieService.get('idToken'));
        id = get(tokenPayload, ['app_metadata', 'clientId']);
      }
    }
    if (id && modelName) {
      return await this._dataService.findById(modelName, id).toPromise();
    }
    console.error(`Data resolver requires 'modelName' and 'id'`);
  }
}