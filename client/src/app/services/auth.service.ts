import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription, timer } from 'rxjs';
import { AWS_S3_PUBLIC_URL } from '../shared/base.url';
import Auth0Lock from 'auth0-lock';
import get from 'lodash/get';

import { CookieService } from 'ngx-cookie-service';
import { RootScopeShareService } from './root-scope-share.service';
import { environment } from '../../environments/environment';

import { filter } from 'rxjs/operators';

export interface UserProfile {
  email: string,
  authId: string,
  clientId: string,
  pictureUrl: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userProfile: UserProfile = <UserProfile>{};
  private _lock: any;
  private _jwtHelper: JwtHelperService = new JwtHelperService();
  private _navSubscription: Subscription;
  private _refreshTokenSubscription: Subscription;
  private _expiresAt: number;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private dataShare: RootScopeShareService,
    private router: Router,
    private _cookieService: CookieService) {
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

    // renew tokens and user profile if accessToken is still available
    if (this.isAuthenticated()) {
      this.scheduleRenewal();
      this._getAuth0UserProfile();
    }
  }

  async login() {
    this._lock.show();
    // hide lock when we navigate away from login page.
    this._navSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationStart)
    ).subscribe((event) => {
        if (this._lock) {
          this._lock.hide();
          this._navSubscription.unsubscribe();
        }
    })    
  }

  onAuthenticated(authResult: any) {
    // this._lock.hide();
    this._setAuthTokens(authResult);
    this._setUserProfile(this._jwtHelper.decodeToken(authResult.idToken));

    // parse user role
    console.log(`Saved Auth0 token for user ${authResult.idTokenPayload.email}`);

    const appMetadata = get(authResult, ['idTokenPayload', environment.auth0Namespace + 'appMetadata'], {});
    const roles = get(appMetadata, 'roles', []);
    this._cookieService.set('roles', JSON.stringify(roles), null, '/');

    // navigate based on user roles.
    if (roles.includes('customer')) {
      // For customer login, save client id.
      const clientId = get(appMetadata, 'clientId');
      if (clientId) {
        this._cookieService.set('clientId', clientId, null, '/');
      } else {
        console.warn('Customer user has no client id');
      }
      this.router.navigate(['auth/customer']);
    }
    if (roles.includes('manager') || roles.includes('admin')) {
      this.router.navigate(['auth/employee']);
    }
    // TODO: handle unauthorized user role.
  }

  logout() {
    // this.dataShare.removeData('storeId')
    this._cookieService.delete('accessToken', '/');
    this._cookieService.delete('idTokne', '/');
    this._cookieService.delete('roles', '/');
    this._cookieService.delete('clientId', '/');
    this._expiresAt = 0;
    this.unscheduleRenewal();

    this._userProfile = <UserProfile>{};
    this._lock.logout({
      returnTo: this._document.location.origin + '/login'
    });
  }

  isAuthenticated() {
    if (this._cookieService.check('accessToken')) {
      const accessToken = this._cookieService.get('accessToken');
      return accessToken && !this._jwtHelper.isTokenExpired(accessToken);      
    }
    return false;
  }

  getUserProfile() {
    return this._userProfile;
  }

  renewTokens() {
    this._lock.checkSession({redirectUri: this._document.location.origin + '/login'}, (err, authResult) => {
      if (err) {
        console.log(err);
      } else {
        this._setAuthTokens(authResult);
      }
    });
  }

  scheduleRenewal() {
    if (!this.isAuthenticated()) {
      return;
    }
    this.unscheduleRenewal();

    const expiresAt = this._expiresAt ? this._expiresAt - Date.now() : 0;
    const renewDelay = Math.max(1, expiresAt);
    // Once the delay time from above is reached, get a new JWT and schedule next fresh.
    this._refreshTokenSubscription = timer(renewDelay).subscribe(() => {
      this.renewTokens();
    });
  }

  unscheduleRenewal() {
    if (this._refreshTokenSubscription) {
      this._refreshTokenSubscription.unsubscribe();
    }
  }

  private async _getAuth0UserProfile(): Promise<void> {
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
          self._setUserProfile(profile);
          // self.dataShare.setData('profile', profile);
        }
      });
    });
  }

  private _setUserProfile(payload: any) {
    if (payload) {
      this._userProfile.email = get(payload, 'email');
      this._userProfile.authId = get(payload, 'sub');
      this._userProfile.clientId = get(payload, [environment.auth0Namespace + 'app_metadata', 'clientId']);
      this._userProfile.pictureUrl = get(payload, 'picture');
    }
  }

  private _setAuthTokens(authResult: any) {
    this._cookieService.set('accessToken', authResult.accessToken, null, '/');
    this._cookieService.set('idToken', authResult.idToken, null, '/');
    // reset token expiration time
    this._expiresAt = (authResult.expiresIn * 1000) + Date.now();
    this.scheduleRenewal();
  }
}
