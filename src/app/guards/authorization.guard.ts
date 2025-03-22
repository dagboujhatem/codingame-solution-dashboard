import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ToastrService } from 'ngx-toastr';

export const authorizationGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr =  inject(ToastrService);
  const userRole = await authService.getAuthUserRole();
  if(userRole === 'Admin'){
    return true;
  }else {
    const routeUrl = state.url;
    if (routeUrl.startsWith('/users') ||
        routeUrl.startsWith('/settings') ||
        routeUrl.startsWith('/subscriptions')) {
          toastr.info(
            "This notification simply means that there is a role setting preventing you from accessing a certain area.",
            "Sorry, you are not authorized to access this page!"
          );
          router.navigate(['/dashboard']);
        return false;
      } else {
        return true;
      }
  }
};
