export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  unit: string; // e.g., 'un', 'kg', '500g'
  originalPrice?: number; // For promotions
  stock: number; // Inventory count
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  deliveryFee: number;
}

export type Category = 
  | 'Todos' 
  | 'Hortifruti' 
  | 'Açougue' 
  | 'Bebidas' 
  | 'Mercearia' 
  | 'Padaria' 
  | 'Limpeza';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhoodId: string;
  };
}

export type PaymentMethod = 'pix' | 'credit_card' | 'cash';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  address: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
}