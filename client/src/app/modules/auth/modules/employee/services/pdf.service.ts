import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';

import { BASE_URL } from '../../../../../shared/base.url';

/*
 * When API returns a file, angular http client expects a JSON object 
 * by default, thus we can't use Loopback SDK API to download a file.
 * This service is to get around the issue by explicitly setting 
 * response type to 'blob'
 */
@Injectable()
export class PdfService {

  constructor(
    private _cookieService: CookieService,
    private _http: HttpClient
  ) { }

  downloadPDF(modelName, methodName, params) {
    const headers = new HttpHeaders()
      .set('Accept', 'application/pdf');
    const httpParams = new HttpParams()
      .set('idToken', this._cookieService.get('idToken'))
      .set('modelName', modelName)
      .set('methodName', methodName)
      .set('params', JSON.stringify(params));
    return this._http.get(BASE_URL + '/api/EmployeeData/file', {
      headers: headers,
      params: httpParams,
      responseType: 'blob'
    })
      .pipe(map((res) => {
        return new Blob([res], { type: 'application/pdf' });
      }));
  }
}