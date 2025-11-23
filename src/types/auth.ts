export interface Store {
    id: number;
    name: string;
    currency: string;
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
    store?: Store;
  }
  
  export interface AuthResponse {
    message: string;
    access_token: string;
    user: User;
  }