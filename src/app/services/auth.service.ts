import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updateEmail,
  updatePassword
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth,
    private router: Router,
    private firestore: Firestore) { }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(username: string, email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(this.firestore, 'users', user.uid), { uid: user.uid, email, username, role: 'User', tokens: 2 });
        return user;
      }));
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
    return signOut(this.auth).then(() => this.router.navigate(['/home']));
  }

  getUserProfile() {
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }
    const uid = user.uid;
    const userRef = doc(this.firestore, `users/${uid}`);
    return getDoc(userRef);
  }

  updateUserProfile(updatedUser: Partial<User>): Observable<any> {
    return new Observable<any>((observer) => {
        // Step 1: Update user from Firebase Authentication
        const user = this.auth.currentUser;
        if (user) {
          const emailUpdate = updatedUser.email ? updateEmail(user, updatedUser.email) : Promise.resolve();
          const passwordUpdate = updatedUser.password ? updatePassword(user, updatedUser.password) : Promise.resolve();
          Promise.all([emailUpdate, passwordUpdate])
          .then(() => {
            // Step 2: Update user in Firestore
            const userRef = doc(this.firestore, `users/${user.uid}`);
            return updateDoc(userRef, updatedUser);
          })
          .then(() => {
            observer.next('User profile updated successfully');
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
        }else {
          observer.error('No authenticated user');
        }
    });
  }

  isAuthenticated(): boolean {
    const currentUser = this.auth.currentUser;
    return !!currentUser;
  }

  async getJWT() {
    const currentUser = this.auth.currentUser;
    const token = await currentUser?.getIdToken();
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
      const profile = await this.getUserProfile();
      if (profile?.exists()) {
        const user: any = profile.data();;
        resolve(user.role)
      } else {
        resolve('User')
      }
    });
  }

  async authUserhasRole(role: string): Promise<boolean> {
    const authUserRole = await this.getAuthUserRole();
    return authUserRole === role;
  }
}
