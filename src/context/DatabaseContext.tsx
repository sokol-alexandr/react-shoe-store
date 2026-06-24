import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Order, CartItem, OrderStatus } from '../types';

type DatabaseContextType = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  placeOrder: (customerId: number | string, items: CartItem[], totalAmount: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  addProduct: (name: string, price: number, imageUrl: string) => Promise<void>;
  deleteProduct: (productId: number, imageUrl: string) => Promise<void>; // Added for CRUD Delete
  updateProduct: (productId: number, name: string, price: number, imageUrl: string) => Promise<void>; // Added for CRUD Update
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

  const placeOrder = async (customerId: string | number, items: CartItem[], totalAmount: number) => {
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

  const addProduct = async (name: string, price: number, imageUrl: string) => {
    const { data, error } = await supabase.from('products').insert([{ name, price, imageUrl }]).select();
    if (error) {
      console.error('Error adding product:', error.message);
    } else if (data && data[0]) {
      setProducts((prev) => [...prev, data[0] as Product]);
    }
  };

  // CRUD: DELETE PRODUCT FROM DATABASE AND STORAGE
  const deleteProduct = async (productId: number, imageUrl: string) => {
    // 1. Delete row from PostgreSQL database table
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (dbError) throw dbError;

    // 2. Parse storage path from public URL and delete the binary file asset
    const storagePath = imageUrl.split('product-images/').pop();
    if (storagePath) {
      await supabase.storage.from('product-images').remove([storagePath]);
    }

    // 3. Update local client state
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  // CRUD: UPDATE PRODUCT DETAILS (PRICE, NAME, IMAGE URL)
  const updateProduct = async (productId: number, name: string, price: number, imageUrl: string) => {
    // 1. Send SQL UPDATE command to Supabase
    const { error } = await supabase
      .from('products')
      .update({ name, price, imageUrl })
      .eq('id', productId);

    if (error) throw error;

    // 2. Update local UI state reactively
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, name, price, imageUrl } : p))
    );
  };

  return (
    <DatabaseContext.Provider value={{ products, orders, isLoading, placeOrder, updateOrderStatus, addProduct, deleteProduct, updateProduct }}>
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