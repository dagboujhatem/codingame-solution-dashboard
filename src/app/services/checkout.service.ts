import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
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

  checkout(productId: string): Observable<{ clientSecret: any }> {
    return this.http.post<{ clientSecret: any }>(`${this.apiUrl}/create-payment-intent`, { productId });
  }
}
