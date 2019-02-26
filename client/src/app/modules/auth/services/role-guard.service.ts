import { Injectable } from '@angular/core';
import { Router, Route, CanActivate, CanActivateChild, CanLoad } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../../services/auth.service';
import { RootScopeShareService } from '../../../services/root-scope-share.service';

import intersection from 'lodash/intersection';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate, CanActivateChild, CanLoad {

  constructor(private _auth: AuthService,
    private _router: Router,
    private _dataShare: RootScopeShareService,
    private _cookieService: CookieService) { }
 
  canActivate(): boolean {
    if (this._auth.isAuthenticated()) {
      const roles = this._cookieService.check('roles') ? JSON.parse(this._cookieService.get('roles')) : [];
      const allowedRoles = ['customer', 'manager', 'admin'];
      if (intersection(roles, allowedRoles).length > 0) {
        return true;
      }
    } 
    this._router.navigate(['/login']);
    return false;
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }

  canLoad(route: Route) {
    if (this.canActivate()) {
      const roles = this._cookieService.check('roles') ? JSON.parse(this._cookieService.get('roles')) : [];
      if (route.path === 'customer' &&
        intersection(['customer'], roles).length > 0) {
        return true;
      }
      if (route.path === 'employee' &&
        intersection(['manager', 'admin'], roles).length > 0) {
        return true;
      }
    }
    return false;
  }
}
