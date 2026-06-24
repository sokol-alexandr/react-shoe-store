import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Order, CartItem, OrderStatus } from '../types';

type DatabaseContextType = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  placeOrder: (customerId: number, items: CartItem[], totalAmount: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  addProduct: (name: string, price: number, imageUrl: string) => Promise<void>; // Added new function type
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: productsData, error: productsError } = await supabase.from('products').select('*');
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*');

      if (productsError) console.error('Error fetching products:', productsError.message);
      if (ordersError) console.error('Error fetching orders:', ordersError.message);

      if (productsData) setProducts(productsData);
      if (ordersData) setOrders(ordersData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const placeOrder = async (customerId: number, items: CartItem[], totalAmount: number) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      customerId,
      items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [...prev, newOrder]);
    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) console.error('Error saving order:', error.message);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: newStatus } : order));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) console.error('Error updating order status:', error.message);
  };

  // NEW: ADD PRODUCT (INSERT INTO SUPABASE)
  const addProduct = async (name: string, price: number, imageUrl: string) => {
    // Insert into Supabase and request the newly created row back (.select())
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price, "imageUrl": imageUrl }])
      .select();

    if (error) {
      console.error('Error adding product to Supabase:', error.message);
    } else if (data && data[0]) {
      // Update local state by appending the newly created product returned from database
      setProducts((prev) => [...prev, data[0] as Product]);
    }
  };

  return (
    <DatabaseContext.Provider value={{ products, orders, isLoading, placeOrder, updateOrderStatus, addProduct }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}