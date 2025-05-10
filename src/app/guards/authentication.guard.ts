import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Auth, authState } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { map, take } from "rxjs";

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr =  inject(ToastrService);
  const auth = inject(Auth);
  return authState(auth).pipe(
    take(1),
    map(user => {
      const isAuthenticated = !!user;
      if(!isAuthenticated){
        if(state.url.startsWith('/checkout')){
          authService.setRedirectUrl(state.url);
          toastr.error('You must be logged in to proceed with the order.', 'Authentication Required');
        }
        router.navigateByUrl('/login');
      }
      return isAuthenticated; 
    })
  );
};
