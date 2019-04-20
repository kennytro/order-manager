import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { BASE_URL } from '../shared/base.url';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private _cookieService: CookieService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(BASE_URL)) {
      let accessToken = this._cookieService.check('accessToken') ? this._cookieService.get('accessToken') : undefined;
      if (accessToken) {
        request = request.clone({
          setHeaders: { 
            Authorization: `Bearer ${accessToken}`
          }
        });
      }
    }
    return next.handle(request);
  }
}