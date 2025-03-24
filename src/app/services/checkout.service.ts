import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Firestore, getDoc, doc, updateDoc, increment } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private apiUrl = environment.codingameSolutionsFunctionUrl;

  constructor(private firestore: Firestore, private http: HttpClient) {

  }

  getSubscription(uid: string) {
    const docRef = doc(this.firestore, 'subscriptions', uid);
    return getDoc(docRef)
  }

  createPaymentIntent(payload: {productId: string, username: string, email: string}): Observable<{ clientSecret: any }> {
    return this.http.post<{ clientSecret: any }>(`${this.apiUrl}/create-payment-intent`, payload);
  }

  updateUserToken(uid: string, tokens: number | undefined, unlimited: boolean | undefined) {
    const tokenToAdd = tokens || 0;
    const unlimitedValue = unlimited || false;
    let updateQuery;
    if(unlimitedValue == true){
      updateQuery = { unlimited: true }
    }else{
      updateQuery = { tokens : increment(tokenToAdd)}
    }
    console.log(updateQuery)
    const userRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userRef, updateQuery);
  }
}
