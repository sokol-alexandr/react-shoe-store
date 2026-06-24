import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import type { OrderStatus } from '../types';

export function CustomerProfilePage() {
  // Access global database and authentication contexts
  const { orders } = useDatabase();
  const { user } = useAuth();

  // FIX: Compare IDs as Strings since Supabase generates string UUIDs instead of numbers
  const myOrders = orders.filter((order) => String(order.customerId) === String(user?.id));

  // Helper function to render status badges consistently
  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      DELIVERED: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Customer Profile</h2>
      <p className="text-sm text-gray-500 mb-6">
        Account Holder: <span className="font-medium text-gray-700">{user?.name}</span>
      </p>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">My Purchase History</h3>

      {myOrders.length === 0 ? (
        <p className="text-gray-500 italic">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {/* Reverse the filtered array to ensure newest orders appear at the top */}
          {[...myOrders].reverse().map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
              
              <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                <div>
                  <span className="font-bold text-gray-900 block">{order.id}</span>
                  <span className="text-xs text-gray-400">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* List out individual items inside this specific order */}
              <div className="space-y-2 mb-3">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} <span className="text-gray-400 font-medium">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-800">
                      {item.product.price * item.quantity} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Paid:</span>
                <span className="text-lg font-bold text-blue-600">{order.totalAmount} ₽</span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}