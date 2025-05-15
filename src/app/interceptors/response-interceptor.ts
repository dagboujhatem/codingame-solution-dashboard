import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest,} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {catchError, switchMap} from 'rxjs/operators';
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

      // Custom 403 error: user must re-authenticate
      if (error.status === 403 && error.error?.mustLoginAgain) {
        return authService.forceLogout().pipe(
          switchMap(() => {
            authService.logout();
            toasterService.info(
              'You have been logged out.',
              'Your session has expired. Please login again.'
            );
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError(() => {
            // Even if /force-logout fails, log the user out
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
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
