export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  material: string;
  category: 'Classic' | 'Premium' | 'Office' | 'Party' | 'Casual' | 'Tote' | 'Mini' | 'Elegant';
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviewsCount: number;
  images: string[];
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin: boolean;
  wishlist?: string[];
}

export interface Address {
  fullName: string;
  mobileNumber: string;
  houseAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Address;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Credit/Debit Card';
  products: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: { name: string; hex: string };
  selectedSize: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  date: string;
}
