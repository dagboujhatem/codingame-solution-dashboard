import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest,} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {inject} from '@angular/core';
import { AuthService } from '../services/auth.service';

export function responseInterceptor(
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {
  const router = inject(Router);
  const toasterService = inject(ToastrService);
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Unauthenticated User error
      if (error.status === 401) {
        // logout the user
        authService.logout();
        toasterService.info(
          'The session has expired.',
          'Your session has expired. Please login again to access your space.'
        );
        // redirect to the login route
        router.navigate(['/login']);
      }
      // Not Found error
      if (error.status === 404) {
        router.navigate(['/404']);
      }
      // Server error
      if (error.status === 500) {
        router.navigate(['/500']);
      }
      return throwError(error);
    })
  );
}
