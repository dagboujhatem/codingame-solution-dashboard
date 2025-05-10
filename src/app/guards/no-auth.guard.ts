import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigateByUrl('/dashboard');
        return false;
      }
      return true;
    })
  );
}; 