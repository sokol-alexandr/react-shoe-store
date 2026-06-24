import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import type { Product, CartItem } from './types';

import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';
import { AuthPage } from './pages/AuthPage';

import { useAuth } from './context/AuthContext';
import { useDatabase } from './context/DatabaseContext';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Pull real auth states and rename flags to handle conflicts gracefully
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { products, isLoading: isDbLoading } = useDatabase();
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState(user?.role);

  // EFFECT: Clear the cart and redirect to home ONLY when the user role actually changes
  useEffect(() => {

  if (user?.role !== currentRole) {
    const transitionedFromGuestToCustomer = !currentRole && user?.role === 'CUSTOMER';
    if (!transitionedFromGuestToCustomer) {
      setCartItems([]); 
    }
    setCurrentRole(user?.role); 
    navigate('/'); 
    }
  }, [user?.role, currentRole, navigate]);

  // --- Cart Operations ---
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleDecreaseQuantity = (productId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Application guard clause preventing flashes while validating persistent credentials
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          <Link to="/" className="text-2xl font-bold tracking-wider hover:text-blue-200 transition-colors">
            ShoeStore 👟
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <span className="font-medium mr-2">
                    Hi, {user.name} ({user.role === 'EMPLOYEE' ? 'Admin' : 'Client'})
                  </span>
                  
                  {/* Admin dashboard link paths */}
                  {user.role === 'EMPLOYEE' && (
                    <div className="flex gap-4 mr-2">
                      <Link to="/admin/orders" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                        Manage Orders
                      </Link>
                      <Link to="/admin/add-product" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                        + Add Product
                      </Link>
                    </div>
                  )}

                  {/* Customer history link paths */}
                  {user.role === 'CUSTOMER' && (
                    <Link to="/profile" className="text-sm font-medium text-blue-200 hover:text-white transition-colors mr-2">
                      My Orders
                    </Link>
                  )}

                  <button 
                    onClick={logout}
                    className="bg-blue-700 px-3 py-1 rounded text-blue-100 hover:bg-blue-800 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Unauthenticated fallback link to login gateway
                <Link to="/auth" className="bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg transition-colors font-medium">
                  Login / Register
                </Link>
              )}
            </div>

            {/* Render cart buttons only for standard consumer viewports */}
            {(!user || user.role === 'CUSTOMER') && (
              <Link to="/cart" className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors font-medium">
                Cart ({totalCartCount})
              </Link>
            )}
          </div>
          
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <Routes>
          <Route path="/" element={
            isDbLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-500 font-semibold animate-pulse">Loading catalog...</p>
              </div>
            ) : (
              <CatalogPage products={products} onAddToCart={handleAddToCart} />
            )
          } />
          <Route path="/cart" element={
            <CartPage 
              cartItems={cartItems} 
              onIncrease={handleAddToCart} 
              onDecrease={handleDecreaseQuantity}
              onRemove={handleRemoveFromCart} 
              onClearCart={handleClearCart}
            />
          } />
          <Route path="/product/:id" element={<ProductDetailsPage products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />   
          <Route path="/profile" element={<CustomerProfilePage />} />
          <Route path="/admin/add-product" element={<AdminAddProductPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </div>
  );
}