import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { Auth, createUserWithEmailAndPassword, updateEmail, updatePassword, deleteUser } from '@angular/fire/auth';
// import * as admin from 'firebase-admin';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore, private auth: Auth) { }

  async addUser(user: User): Promise<any> {
    // Step 1: Add user from Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.password);
    user.uid = userCredential.user.uid;
    // Step 2: Add user from Firestore
    const usersRef = collection(this.firestore, 'users');
    return addDoc(usersRef, { ...user, uid: userCredential.user.uid });
  }

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>;
  }

  async updateUser(uid: string, user: Partial<User>): Promise<any> {
    // Step 1: Update user from Firebase Authentication
    // if (user.email) {
    //   await admin.auth().updateUser(uid, { email: user.email });
    // }
    // if (user.password) {
    //   await admin.auth().updateUser(uid, { password: user.password });
    // }
    // Step 2: Update user from Firestore
    const userRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userRef, user);
  }

  async deleteUser(uid: string): Promise<any> {
    // Step 1: Delete user from Firebase Authentication
    // const user = await admin.auth().getUser(uid);
    // if (user) {
    //   await admin.auth().deleteUser(uid);
    //   console.log('User successfully deleted from Firebase Authentication');
    // }
    // Step 2: Delete user from Firestore
    const userRef = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userRef);
  }
}
