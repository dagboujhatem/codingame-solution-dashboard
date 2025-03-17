import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, deleteDoc, getDocs, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Subscription {
  id: string;
  name: string;
  credits?: number;
  unlimited?: boolean;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private collectionName = 'subscriptions';

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Subscription[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    return new Observable((observer) => {
      getDocs(collectionRef).then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscription[];
        observer.next(data);
        observer.complete();
      });
    });
  }

  getById(id: string): Observable<Subscription | undefined> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }) as Observable<Subscription>;
  }

  create(subscription: Subscription): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, subscription.id);
    return setDoc(docRef, subscription);
  }

  update(id: string, subscription: Partial<Subscription>): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, subscription);
  }

  delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return deleteDoc(docRef);
  }
}
