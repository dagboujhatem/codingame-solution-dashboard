import { Injectable } from '@angular/core';
import { Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut } from '@angular/fire/auth';
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
    private firestore: Firestore) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(username: string, email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(this.firestore, 'users', user.uid), { email, username, role: 'User', tokens: 2});
      return user;
    }));
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

  getUserProfile() {
    const user = this.auth.currentUser;
    if(!user) {
      return;
    }
    const uid = user.uid;
    const userRef = doc(this.firestore, `users/${uid}`);
    return getDoc(userRef);
  }

  updateUserProfile(uid: string, updatedUser: Partial<User>): Observable<any>{
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(updateDoc(userRef, updatedUser));
  }

  isAuthenticated(): boolean {
    const user = this.auth.currentUser;
    return !!user;
  }

  setRedirectUrl(url : string){
    localStorage.setItem('redirectUrl', url);
  }

  getRedirectUrl(){
    return localStorage.getItem('redirectUrl');
  }

  removeRedirectUrl(){
    localStorage.removeItem('redirectUrl');
  }

  async getUserRole(userId: string): Promise<string | null> {
    const userDoc = await getDoc(doc(this.firestore, 'users', userId));
    return userDoc.exists() ? userDoc.data()["role"] : null;
  }

  hasRole(role: string): boolean {
    return localStorage.getItem('userRole') === role;
  }
}
