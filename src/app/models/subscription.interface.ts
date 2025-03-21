export interface Subscription {
  id: string;
  name: string;
  credits?: number;
  unlimited?: boolean;
  price: number;
}
