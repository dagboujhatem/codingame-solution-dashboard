import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) { }

  addUser(user: User): Promise<any> {
    const usersRef = collection(this.firestore, 'users');
    return addDoc(usersRef, user);
  }

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>;
  }

  updateUser(uid: string, user: Partial<User>): Promise<any> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userRef, user);
  }

  deleteUser(uid: string): Promise<any> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userRef);
  }
}
