import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { Auth } from "@angular/fire/auth";

export const authGuard: CanActivateFn = async (route, state) => {
  const angularFireAuth = inject(Auth);
  const router = inject(Router);
  const user = await angularFireAuth.currentUser;
  // coerce to boolean
  const isLoggedIn = !!user;
  if(!isLoggedIn){
    router.navigateByUrl('/login');
  }
  return isLoggedIn;
};
