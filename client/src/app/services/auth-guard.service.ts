import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad {

  constructor(private _auth: AuthService, private _router: Router) { }

  canLoad(route: Route) {
    if (!this._auth.isAuthenticated()) {
      this._router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
