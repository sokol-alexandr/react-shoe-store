import { Link, useNavigate } from 'react-router-dom';
import type { CartItem, Product } from '../types';

// Import our custom hooks
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';

// --- Circular Button Component ---
type CircleButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

function CircleButton({ onClick, disabled, children }: CircleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all ${
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 shadow-sm'
      }`}
    >
      {children}
    </button>
  );
}

// --- Trash Icon Component ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

type CartPageProps = {
  cartItems: CartItem[];
  onIncrease: (product: Product) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onClearCart: () => void;
};

export function CartPage({ cartItems, onIncrease, onDecrease, onRemove, onClearCart }: CartPageProps) {
  // Calculate total price based on item price and its quantity
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Get functions and user from context
  const { placeOrder } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handler for the Checkout button
  const handleCheckout = async () => {
    if (!user) return; 
    
    // Send order to the database
    await placeOrder(user.id, cartItems, totalPrice);
    onClearCart(); // Clear the cart after successful order placement
    // Redirect to the home page after ordering
    navigate('/profile'); // Redirect to profile page to view order history
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
      
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.product.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <Link to={`/product/${item.product.id}`} className="hover:text-blue-600 transition-colors font-medium">
                  {item.product.name}
                </Link>
                
                <div className="flex items-center gap-6">
                  
                  <div className="flex items-center gap-3">
                    <CircleButton 
                      onClick={() => onDecrease(item.product.id)} 
                      disabled={item.quantity <= 1}
                    >
                      -
                    </CircleButton>
                    
                    <span className="font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    
                    <CircleButton 
                      onClick={() => onIncrease(item.product)}
                    >
                      +
                    </CircleButton>
                  </div>

                  <span className="font-bold text-gray-800 w-24 text-right">
                    {item.product.price * item.quantity} ₽
                  </span>
                  
                  <button 
                    onClick={() => onRemove(item.product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Remove item"
                  >
                    <TrashIcon />
                  </button>
                </div>

              </li>
            ))}
          </ul>
          
          <div className="border-t border-gray-200 pt-4 flex flex-col items-end">
            <p className="text-lg text-gray-600 mb-4">
              Total: <span className="text-2xl font-bold text-gray-800 ml-2">{totalPrice} ₽</span>
            </p>
            <button 
              onClick={handleCheckout}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-bold transition-colors shadow-sm"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}