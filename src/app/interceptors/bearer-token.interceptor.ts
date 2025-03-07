import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { from, lastValueFrom } from "rxjs";
import { Auth } from "@angular/fire/auth";

// needs to add this function because getting the token is async
const addBearerToken = async (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Promise<HttpEvent<any>> => {
  const angularFireAuth = inject(Auth);
  const firebaseUser = await angularFireAuth.currentUser;
  const token = await firebaseUser?.getIdToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return lastValueFrom(next(req));
};

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // only add the bearer token to requests to the backend
  // Note that you can customize it to only add the bearer token to certain requests
  if (true) {
    return from(addBearerToken(req, next));
  } else {
    return next(req);
  }
};
