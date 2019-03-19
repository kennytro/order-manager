import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription } from 'rxjs';
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
  private navSubscription: Subscription;

  constructor(private dataShare: RootScopeShareService,
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

    // restore user profile if accessToken is still available
    if (this.isAuthenticated()) {
      this._getAuth0UserProfile();
    }
  }

  async login() {
    this._lock.show();
    // hide lock when we navigate away from login page.
    this.navSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationStart)
    ).subscribe((event) => {
        if (this._lock) {
          this._lock.hide();
          this.navSubscription.unsubscribe();
        }
    })    
  }

  onAuthenticated(authResult: any) {
    // this._lock.hide();
    this._cookieService.set('accessToken', authResult.accessToken, null, '/');
    this._cookieService.set('idToken', authResult.idToken, null, '/');
    this._setUserProfile(this._jwtHelper.decodeToken(authResult.idToken));

    // parse user role
    console.log(`Saved Auth0 token for user ${authResult.idTokenPayload.email}`);

    const appMetadata = get(authResult, ['idTokenPayload', environment.auth0Namespace + 'appMetadata'], {});
    const roles = get(appMetadata, 'roles', []);
    this._cookieService.set('roles', JSON.stringify(roles), null, '/');

    // TODO: parse customer's store id
    // this.dataShare.setData('storeId', appMetadata.storeId);
    // navigate based on user roles.
    if (roles.includes('customer')) {
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

    this._userProfile = <UserProfile>{};

    this.router.navigate(['/login']);
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

}
