import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface InquiryResponse {
  success: boolean,
  postTime: Date,
  errorMessage: string
};

@Injectable()
export class MessageService {

  constructor(private http: HttpClient) { }

  submitInquiry(reCAPTCHAResponse, message): Observable<InquiryResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<InquiryResponse>('/inquiry',
      {
        verifyToken: reCAPTCHAResponse,
        message: message
      }, httpOptions);
  }
}
