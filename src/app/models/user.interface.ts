export interface User {
  uid: string;
  username: string;
  email: string;
  password: string;
  role: string;
  tokens?: number;
  unlimited?: boolean;
}
