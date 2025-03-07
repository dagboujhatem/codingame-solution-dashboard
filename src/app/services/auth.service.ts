import { Injectable } from '@angular/core';
import { Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private router: Router) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(username: string, email: string, password: string) {
   // You can add username to the Firestore user document after registration
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  forgotPassword(email: string){
    const actionCodeSettings = {
      url: 'http://localhost:4200/#/reset-password', // Your custom reset password page
      handleCodeInApp: true, // Ensures the reset happens in your app
    };
    return from(sendPasswordResetEmail(this.auth, email, actionCodeSettings))
  }

  resetPassword(oobCode: string, newPassword: string){
    return from(confirmPasswordReset(this.auth, oobCode, newPassword))
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  get user() {
    return this.auth.currentUser;
  }

  // isAuthenticated(): Observable<boolean> {
  //   return this.auth.authState.pipe(map(user => !!user));
  // }

}
