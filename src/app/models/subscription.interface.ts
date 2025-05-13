export interface Subscription {
  uid: string;
  name: string;
  description: string;
  credits?: number;
  unlimited?: boolean;
  price: number;
  promoPrice: number;
  stripeProductId: any;
  stripePriceId: any;
  interval: any;
  features?: Array<{
    key: string;
    value: string;
  }>;
}
