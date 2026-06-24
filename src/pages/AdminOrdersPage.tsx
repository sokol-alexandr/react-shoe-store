import { useDatabase } from '../context/DatabaseContext';
import type { OrderStatus } from '../types';

export function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useDatabase();

  // Helper function to render beautiful badges based on order status
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
      <h2 className="text-xl font-bold text-gray-800 mb-6">Store Management: Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders placed yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50 text-left font-semibold text-gray-700">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{order.id}</td>
                  <td className="p-4">
                    {order.items.map((item) => (
                      <div key={item.product.id}>
                        {item.product.name} <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-bold text-gray-800">{order.totalAmount} ₽</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right">
                    {order.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-medium text-xs transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'REJECTED')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-medium text-xs transition-colors shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {order.status === 'APPROVED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium text-xs transition-colors shadow-sm"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="text-xs text-gray-400 italic">Completed</span>
                    )}
                    {order.status === 'REJECTED' && (
                      <span className="text-xs text-red-400 italic font-medium">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}