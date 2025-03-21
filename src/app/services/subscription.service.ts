import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private firestore: Firestore) {}

  getAll(): Observable<Subscription[]> {
    const collectionRef = collection(this.firestore, 'subscriptions');
    return collectionData(collectionRef, { idField: 'uid' }) as Observable<Subscription[]>;
  }

  create(subscription: Subscription): Promise<any> {
    const docRef = collection(this.firestore, 'subscriptions');
    return addDoc(docRef, subscription);
  }

  update(uid: string, subscription: Partial<Subscription>): Promise<void> {
    const docRef = doc(this.firestore, 'subscriptions', uid);
    return updateDoc(docRef, subscription);
  }

  delete(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'subscriptions', uid);
    return deleteDoc(docRef);
  }
}
