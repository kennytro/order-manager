import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AWS_S3_PUBLIC_URL } from '../shared/base.url';
import Auth0Lock from 'auth0-lock';
import get from 'lodash/get';

import { CookieService } from 'ngx-cookie-service';
import { RootScopeShareService } from './root-scope-share.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private 
  private _lock: any;
  private _jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private dataShare: RootScopeShareService,
    private router: Router,
    private _cookieService: CookieService) {}

  async login() {
    // for some reason, saved lock doesn't show again after navigating away to other page.
    // if (!this._lock) {
      // retrieve tenant Auth0 parameters.
      let tenant = this.dataShare.getData('tenant');
      this._lock = new Auth0Lock(tenant.clientId, tenant.domainId, {
        container: 'login-content-wrapper',
        allowSignUp: false,
        closable: false,
        avatar: null,
        rememberLastLogin: false,
        auth: {
          audience: tenant.audience,
          redirect: false,
          responseType: 'token id_token',
          params: {
            scope: 'openid email profile'
          }
        },
        languageDictionary: {
          title: ''
        },
        theme: {
          logo: AWS_S3_PUBLIC_URL + tenant.id + '/favicon.png',
          primaryColor: '#0B941E'
        }
      });

      this._lock.on('authenticated', this.onAuthenticated.bind(this));
      this._lock.on('authorization_error', error => {
        console.log('something went wrong', error);
      });
    // }
    this._lock.show();
  }

  onAuthenticated(authResult: any) {
    this._lock.hide();
    this._cookieService.set('accessToken', authResult.accessToken, null, '/');
    this._cookieService.set('idToken', authResult.idToken, null, '/');
    // parse user role
    console.log(`Saved Auth0 token for user ${authResult.idTokenPayload.email}`);

    const appMetadata = get(authResult, ['idTokenPayload', environment.auth0Namespace + 'appMetadata'], {});
    this._cookieService.set('roles', JSON.stringify(appMetadata.roles), null, '/');

    // TODO: parse customer's store id
    // this.dataShare.setData('storeId', appMetadata.storeId);
    this.router.navigate(['/auth']);    
  }

  logout() {
    // this.dataShare.removeData('storeId')
    this._cookieService.delete('accessToken', '/');
    this._cookieService.delete('idTokne', '/');
    this._cookieService.delete('roles', '/');

    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    if (this._cookieService.check('accessToken')) {
      const accessToken = this._cookieService.get('accessToken');
      return accessToken && !this._jwtHelper.isTokenExpired(accessToken);      
    }
    return false;
  }


  async getProfile(): Promise<void> {
    const accessToken = this._cookieService.check('accessToken') ? this._cookieService.get('accessToken') : undefined;
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    const self = this;
    await new Promise((resolve, reject) => {
      self._lock.getUserInfo(accessToken, function(error, profile) {
        if (error) {
          reject(error);
        } else {
          self.dataShare.setData('profile', profile);
        }
      });
    });
  }
}
