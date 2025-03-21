import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;
  private apiUrl = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api';

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  async checkout(priceId: string): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      console.error('Stripe failed to load');
      return;
    }

    this.http.post<{ sessionId: string }>(`${this.apiUrl}/create-checkout-session`, { priceId })
      .subscribe(async (res) => {
        const { sessionId } = res;
        await stripe.redirectToCheckout({ sessionId });
      });
  }
}
