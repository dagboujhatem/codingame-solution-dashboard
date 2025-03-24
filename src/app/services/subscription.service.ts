import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, getDoc, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = environment.codingameSolutionsFunctionUrl;

  constructor(private firestore: Firestore, private http: HttpClient) {}

  getAll(): Observable<Subscription[]> {
    const collectionRef = collection(this.firestore, 'subscriptions');
    return collectionData(collectionRef, { idField: 'uid' }) as Observable<Subscription[]>;
  }

  create(subscription: Subscription): Promise<any> {
   return new Promise(async (resolve, reject)=>{
      const payload = {
        name: subscription.name,
        description: subscription.description,
        price: subscription.promoPrice ? subscription.promoPrice : subscription.price,
        interval: subscription.interval
      }
      // Step 1: Create the product/price in Stripe
      this.http.post(`${this.apiUrl}/create-product`, payload)
      .subscribe(async (res : any) => {
        const { product, price } = res;
        // Step 2: Create the subscription in firestore
        const docRef = collection(this.firestore, 'subscriptions');
        const newSubscription = { ...subscription, stripeProductId: product.id, stripePriceId: price.id };
        await addDoc(docRef, newSubscription);
        resolve({ product, price })
      });
    });
  }

  update(uid: string, subscription: Partial<Subscription>): Promise<void> {
    return new Promise(async (resolve, reject)=>{
      // Step 1: Find stripeProductId from firestore
      const docRef = doc(this.firestore, 'subscriptions', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return reject(new Error("Subscription not found in Firestore"));
      }
      const subData : any = docSnap.data();
      const stripeProductId = subData.stripeProductId;
      // Step 2: Update the subscription in firestore
      await updateDoc(docRef, subscription);
      // Step 3: Update product/price in Stripe
      const payload = {
        name: subscription.name,
        description: subscription.description,
        price: subscription.promoPrice ? subscription.promoPrice : subscription.price,
        interval: subscription.interval
      }
      await this.http.put(`${this.apiUrl}/update-product/${stripeProductId}`, payload).toPromise();
      resolve()
    });
  }

  delete(uid: string): Promise<void> {
    return new Promise(async (resolve, reject)=>{
      // Step 1: Find stripeProductId from firestore
      const docRef = doc(this.firestore, 'subscriptions', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return reject(new Error("Subscription not found in Firestore"));
      }
      const subData : any = docSnap.data();
      const stripeProductId = subData.stripeProductId;
      // Step 2: Delete the subscription in firestore
      await deleteDoc(docRef);
      // Step 3: Delete the product/price in Stripe
      await this.http.delete(`${this.apiUrl}/delete-product/${stripeProductId}`).toPromise();
      resolve()
    });
  }
}
