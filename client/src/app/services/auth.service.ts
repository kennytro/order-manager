import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AWS_S3_PUBLIC_URL } from '../shared/base.url';
import Auth0Lock from 'auth0-lock';
import get from 'lodash/get';

import { RootScopeShareService } from './root-scope-share.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private lock: any;
  private jwtHelper: JwtHelperService = new JwtHelperService();
  constructor(private dataShare: RootScopeShareService, private router: Router) {}

  async login() {
    // for some reason, saved lock doesn't show again after navigating away to other page.
    // if (!this.lock) {
      // retrieve tenant Auth0 parameters.
      let tenant = this.dataShare.getData('tenant');
      this.lock = new Auth0Lock(tenant.clientId, tenant.domainId, {
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

      this.lock.on('authenticated', this.onAuthenticated.bind(this));
      this.lock.on('authorization_error', error => {
        console.log('something went wrong', error);
      });
    // }
    this.lock.show();
  }

  onAuthenticated(authResult: any) {
    this.lock.hide();
    this.dataShare.setData('accessToken', authResult.accessToken);
    // this.dataShare.setData('idToken', authResult.idToken);
    
    // parse user role
    console.log(`Saved Auth0 token for user ${authResult.idTokenPayload.email}`);

    const appMetadata = get(authResult, ['idTokenPayload', environment.auth0Namespace + 'appMetadata'], {});
    this.dataShare.setData('role', appMetadata.roles);

    // TODO: parse customer's store id
    // this.dataShare.setData('storeId', appMetadata.storeId);
    this.router.navigate(['/auth']);    
  }

  logout() {
    this.dataShare.removeData('accessToken');
    // this.dataShare.removeData('idToken');    
    this.dataShare.removeData('roles');
    // this.dataShare.removeData('storeId')
    this.router.navigate(['/public/login']);
  }

  isAuthenticated() {
    const accessToken = this.dataShare.getData('accessToken');
    return accessToken && !this.jwtHelper.isTokenExpired(accessToken);
  }

  async getProfile(): Promise<void> {
    const accessToken = this.dataShare.getData('accessToken');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    const self = this;
    await new Promise((resolve, reject) => {
      self.lock.getUserInfo(accessToken, function(error, profile) {
        if (error) {
          reject(error);
        } else {
          self.dataShare.setData('profile', profile);
        }
      });
    });
  }
}
