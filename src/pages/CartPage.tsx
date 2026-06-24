import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../types';

type CartPageProps = {
  cartItems: CartItem[];
  onIncrease: (product: any) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onClearCart: () => void;
};

export function CartPage({ cartItems, onIncrease, onDecrease, onRemove, onClearCart }: CartPageProps) {
  const { placeOrder } = useDatabase();
  const { user } = useAuth(); // Pull real-time auth state to verify if user is logged in
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    // Safety guard fallback: technically button is hidden, but code check keeps pipeline secure
    if (!user) {
      alert('Please log in to complete your purchase.');
      navigate('/auth');
      return;
    }

    try {
      await placeOrder(user.id, cartItems, totalPrice);
      alert('Order placed successfully! Check your history in profile.');
      onClearCart();
      navigate('/profile');
    } catch (error: any) {
      alert(`Checkout failed: ${error.message}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any shoes to your cart yet.</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-sm">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Shopping Cart</h2>

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between py-4 first:pt-2 last:pb-2">
            <div className="flex items-center gap-4">
              <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-md bg-gray-50 border border-gray-100" />
              <div>
                <h3 className="font-bold text-gray-800">{item.product.name}</h3>
                <p className="text-gray-500 text-sm">{item.product.price} ₽</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                <button onClick={() => onDecrease(item.product.id)} className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition-colors rounded-l-md font-bold">-</button>
                <span className="px-3 text-sm font-semibold text-gray-700">{item.quantity}</span>
                <button onClick={() => onIncrease(item.product)} className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition-colors rounded-r-md font-bold">+</button>
              </div>
              <span className="font-bold text-gray-800 w-20 text-right">{item.product.price * item.quantity} ₽</span>
              <button onClick={() => onRemove(item.product.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold block">Total Amount:</span>
          <span className="text-2xl font-extrabold text-blue-600">{totalPrice} ₽</span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onClearCart} className="w-1/2 sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm">
            Clear Cart
          </button>

          {/* GUEST FLOW vs AUTHENTICATED USER CONDITIONAL RENDERING */}
          {user ? (
            /* User is logged in -> render standard submit checkout script button */
            <button
              onClick={handleCheckout}
              className="w-1/2 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              Place Order
            </button>
          ) : (
            /* User is an unauthenticated Guest -> redirect to security gateway layout */
            <Link
              to="/auth"
              className="w-1/2 sm:w-auto bg-amber-500 hover:bg-amber-600 text-white text-center font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              Login to Checkout 🔐
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}