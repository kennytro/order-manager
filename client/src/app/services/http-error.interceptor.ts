import {
 HttpEvent,
 HttpInterceptor,
 HttpHandler,
 HttpRequest,
 HttpResponse,
 HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export class HttpErrorInterceptor implements HttpInterceptor {
 intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   return next.handle(request)
     .pipe(
       retry(1),
       catchError((errorRes: HttpErrorResponse) => {
         let errorMessage = '';
         if (errorRes.error instanceof ErrorEvent) {
           // client-side error
           errorMessage = `Error: ${errorRes.error.message}`;

           // TO DO: send error to server
         } else {
           // server-side error
           errorMessage = `Error Code: ${errorRes.status}\nMessage: ${errorRes.error.error.message}`;
         }
         window.alert(errorMessage);
         return throwError(errorRes);
       })
     )
 }
}
