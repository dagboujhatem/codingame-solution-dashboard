import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updateEmail,
  updatePassword,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { User } from '../models/user.interface';
import { updateProfile } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  private avatar$ = new BehaviorSubject<string>('');
  public authState$ = this.authStateSubject.asObservable();

  constructor(private auth: Auth,
    private router: Router,
    private firestore: Firestore) {
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
    return from(createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
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
    return signOut(this.auth).then(() => {
      this.router.navigate(['/home']);
    });
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
          const usernameUpdate = updatedUser.username ? updateProfile(user, { displayName: updatedUser.username } ) : Promise.resolve();
          Promise.all([emailUpdate, usernameUpdate])
          .then(async() => {
            // Step 2: Update user in Firestore
            const userRef = doc(this.firestore, `users/${user.uid}`);
            await updateDoc(userRef, updatedUser);

            // Step 3: Notify avatar reload
            await user.reload();
            this.loadUserAvatar();
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

  loadUserAvatar(){
    this.getUserProfile()?.then((profile)=>{
      if (profile?.exists()) {
        const user = profile.data();
        const currentUserAvatar = this.getCurrentUserAvatar();
        if (currentUserAvatar) {    
          this.avatar$.next(currentUserAvatar);
        }else {
          const username = user['username'] || 'Anonymous User';
          const avatar = user['avatar'] || `https://ui-avatars.com/api/?name=${username}&background=random`;
          this.avatar$.next(avatar); 
        }
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

  updateUserPassword(updatedUser: Partial<User>): Observable<any> {
    return new Observable<any>((observer) => {
      const user = this.auth.currentUser;
      if (user) {
        updatePassword(user, updatedUser?.password || '')
        .then(() => {
          observer.next('Password updated successfully');
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
    return this.authStateSubject.value;
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

  async createUser(userData: User) {
    const userRef = doc(this.firestore, 'users', userData.uid);
    await setDoc(userRef, userData);
  }

  async getUser(uid: string): Promise<User | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  }

  async updateUser(uid: string, data: Partial<User>) {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, data);
  }
}
