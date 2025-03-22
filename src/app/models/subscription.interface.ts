export interface Subscription {
  uid: string;
  name: string;
  credits?: number;
  unlimited?: boolean;
  price: number;
  promoPrice: number;
}
