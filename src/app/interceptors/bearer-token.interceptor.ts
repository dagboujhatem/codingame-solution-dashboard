import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { from, lastValueFrom } from "rxjs";
import { AuthService } from "../services/auth.service";
import { jwtDecode } from 'jwt-decode';


const addBearerToken = async (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Promise<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = await authService.getJWT();
  if (isTokenValid(token)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return lastValueFrom(next(req));
};

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('firebase')) {
    return from(addBearerToken(req, next));
  } else {
    return next(req);
  }
};

const isTokenValid = (token: string | null | undefined): boolean => {
  if (!token) return false;
  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp && decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};
