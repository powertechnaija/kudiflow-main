export interface Store {
    id: string;
    name: string;
    currency: string;
  }
  
  export interface User {
    id: string;
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