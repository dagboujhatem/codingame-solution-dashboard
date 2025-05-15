import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  from, BehaviorSubject, tap,
  Observable
} from 'rxjs';
import { User } from '../models/user.interface';
import { getIdTokenResult } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.codingameSolutionsFunctionUrl;
  private authStateSubject = new BehaviorSubject<boolean>(false);
  private avatar$ = new BehaviorSubject<string>('');
  public authState$ = this.authStateSubject.asObservable();

  constructor(private auth: Auth,
    private router: Router,
    private http: HttpClient) {
    // Écouter les changements d'état d'authentification Firebase
    onAuthStateChanged(this.auth, (user) => {
      this.authStateSubject.next(!!user);
      this.loadUserAvatar();
    });
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  forgotPassword(email: string) {
    const actionCodeSettings = {
      url: 'http://localhost:4200/#/reset-password', // Your custom reset password page
      handleCodeInApp: true, // Ensures the reset happens in your app
    };
    return from(sendPasswordResetEmail(this.auth, email, actionCodeSettings))
  }

  resetPassword(oobCode: string, newPassword: string) {
    return from(confirmPasswordReset(this.auth, oobCode, newPassword))
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.router.navigate(['/home']);
    });
  }

  getUserProfile() {
    return this.http.get<User>(`${this.apiUrl}/get-auth-user`);
  }

  updateUserProfile(updatedUser: Partial<User>): Observable<any> {
    // add pipe to reload user
    return this.http.put(`${this.apiUrl}/update-auth-user`, updatedUser).pipe(
      tap(async () => {
        // Step 3: Notify avatar reload
        const user = this.auth.currentUser;
        if (user) {
          await user.reload();
          this.loadUserAvatar();
        } else {
          console.error('No authenticated user');
        }
      })
    );
  }

  loadUserAvatar() {
    this.getUserProfile().subscribe((profile: any) => {
      const currentUserAvatar = this.getCurrentUserAvatar();
      if (currentUserAvatar) {
        this.avatar$.next(currentUserAvatar);
      } else {
        const username = profile['username'] || 'Anonymous User';
        const avatar = profile['avatar'] || `https://ui-avatars.com/api/?name=${username}&background=random`;
        this.avatar$.next(avatar);
      }
    });
  }

  getCurrentUserAvatar() {
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }
    return user.photoURL;
  }

  getAvatar$(): Observable<string> {
    return this.avatar$.asObservable();
  }

  updateUserPassword(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-auth-user-password`, payload);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  async getJWT(forceRefresh = true) {
    const currentUser = this.auth.currentUser;
    const token = await currentUser?.getIdToken(forceRefresh);
    return token;
  }

  setRedirectUrl(url: string) {
    localStorage.setItem('redirectUrl', url);
  }

  getRedirectUrl() {
    return localStorage.getItem('redirectUrl');
  }

  removeRedirectUrl() {
    localStorage.removeItem('redirectUrl');
  }

  getAuthUserRole(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        const token = await getIdTokenResult(user);
        const role = token.claims['role'] as string;
        if (role) {
          resolve(role);
        } else {
          resolve('');
        }
      } else {
        resolve('');
      }
    });
  }

  async authUserhasRole(role: string): Promise<boolean> {
    const authUserRole = await this.getAuthUserRole();
    return authUserRole === role;
  }

}
