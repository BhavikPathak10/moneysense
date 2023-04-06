import { Injectable } from '@angular/core';

import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private token: TokenStorageService, private auth : AuthService ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    let _request = request;
    const token = this.token.getToken();
    if (token != null) {
      _request = _request.clone({ params: request.params.set('auth',token)});
    }
    _request.headers.append('Content-Type', 'application/json');

    return next.handle(_request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let data = {};
        data = {
          reason:
            error && error.error && error.error.reason
              ? error.error.reason
              : '',
          status: error.status,
        };
        if([403,401].includes(error.status)){
          this.auth.reLoginPrompt();
        }
        return throwError(error);
      })
    );
  }
}
