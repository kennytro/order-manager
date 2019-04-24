import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

@Injectable()
export class FileService {

  constructor(private _http: HttpClient) { }

  downloadPDF(dataUrl: string) {
    if (dataUrl) {
      let headers = new HttpHeaders();
      headers = headers.set('Accept', 'application/pdf');
      return this._http.get(dataUrl, { headers: headers, responseType: 'blob' })
        .pipe(map((res) => {
          return new Blob([res], { type: 'application/pdf' });
        }));
    }
  }
}
