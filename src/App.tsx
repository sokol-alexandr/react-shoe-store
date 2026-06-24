import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import type { Product, CartItem } from './types';

import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';

import { useAuth } from './context/AuthContext';
// Import our custom database hook
import { useDatabase } from './context/DatabaseContext';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const { user, loginAs } = useAuth();
  // Extract products from the database context
  const { products, isLoading  } = useDatabase();
  // Hook for programmatic navigation (redirecting)
  const navigate = useNavigate();

 const [currentRole, setCurrentRole] = useState(user?.role);

  // EFFECT: Clear the cart and redirect to home ONLY when the user role actually changes
  useEffect(() => {
    if (user?.role !== currentRole) {
      // This block will run only if the role switched (e.g., Customer <-> Admin)
      setCartItems([]); // Clear the cart safely
      setCurrentRole(user?.role); // Update the tracked role
      navigate('/'); // Redirect to homepage
    }
  }, [user?.role, currentRole, navigate]);

  // --- Cart Microflows ---
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          <Link to="/" className="text-2xl font-bold tracking-wider hover:text-blue-200 transition-colors">
            ShoeStore 👟
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium mr-2">
                Hi, {user?.name || 'Guest'}
              </span>
              
              {user?.role === 'CUSTOMER' && (
                <button 
                  onClick={() => loginAs('EMPLOYEE')}
                  className="bg-blue-800 px-3 py-1 rounded text-blue-100 hover:bg-blue-900 transition-colors"
                >
                  Switch to Admin
                </button>
              )}
               {user?.role === 'EMPLOYEE' && (
             <Link to="/admin/orders" className="text-sm font-medium text-blue-200 hover:text-white transition-colors mr-2">
               Manage Orders Dashboard
             </Link>
              )}
              {/* If user is an Employee, show admin navigation links */}
              {user?.role === 'EMPLOYEE' && (
                <div className="flex gap-4 mr-2">
                  <Link to="/admin/orders" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                    Manage Orders
                  </Link>
                  <Link to="/admin/add-product" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                    + Add Product
                  </Link>
                </div>
              )}
              {user?.role === 'EMPLOYEE' && (
                <button 
                  onClick={() => loginAs('CUSTOMER')}
                  className="bg-blue-800 px-3 py-1 rounded text-blue-100 hover:bg-blue-900 transition-colors"
                >
                  Switch to Client
                </button>
              )}
            </div>

            {/* If current user is Customer, show link to their profile/orders */}
         {user?.role === 'CUSTOMER' && (
           <Link to="/profile" className="text-sm font-medium text-blue-200 hover:text-white transition-colors mr-2">
             My Orders
           </Link>
         )}

         {/* Hide cart button if user is an Employee */}
         {user?.role === 'CUSTOMER' && (
           <Link to="/cart" className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors font-medium">
             Cart ({totalCartCount})
           </Link>
         )}
          </div>
          
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <Routes>
          {/* We now pass 'products' from the DatabaseContext instead of hardcoded array */}
          <Route path="/" element={
            isLoading ? (
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
        </Routes>
      </main>
    </div>
  );
}