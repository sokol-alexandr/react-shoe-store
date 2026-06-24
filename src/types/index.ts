// --- ENUMERATIONS (Mendix Enumeration equivalents) ---

// User roles in the system
export type Role = 'CUSTOMER' | 'EMPLOYEE';

// Possible states of an order
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';


// --- ENTITIES (Mendix Entity equivalents) ---

// Represents an authenticated user (Similar to System.User)
export type User = {
  id: number | string; 
  name: string;
  role: Role;
};

// Represents a single product in the catalog (Moved from ProductCard.tsx)
export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

// Represents a line item in a cart or an order
export type CartItem = {
  product: Product;
  quantity: number;
};

// Represents a completed order
export type Order = {
  id: string; // Typically a unique string like "ORD-1001"
  customerId: number; // Association to the User who made the order
  items: CartItem[]; // List of items purchased
  totalAmount: number; // Calculated total price
  status: OrderStatus; 
  createdAt: string; // ISO date string format
};