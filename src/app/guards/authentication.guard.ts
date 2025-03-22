import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ToastrService } from 'ngx-toastr';

export const authenticationGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr =  inject(ToastrService);
  const isLoggedIn = authService.isAuthenticated();
  if(!isLoggedIn){
    if(state.url.startsWith('/checkout')){
      authService.setRedirectUrl(state.url);
      toastr.error('You must be logged in to proceed with the order.', 'Authentication Required');
    }
    router.navigateByUrl('/login');
  }
  return isLoggedIn;
};
