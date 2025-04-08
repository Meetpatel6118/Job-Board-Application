import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Pass the request to real backend (no longer using fake localStorage logic)
    return next.handle(request);
  }
}

export const apiBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiBackendInterceptor,
  multi: true
};
