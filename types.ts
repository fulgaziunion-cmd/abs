
export type Category = 'Bookstore' | 'Stationery' | 'Computer Accessories' | 'Services';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  author?: string;
  specs?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  transactionId?: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Completed';
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  servicesProvided: string;
  bkashNumber: string;
  nagadNumber: string;
}
