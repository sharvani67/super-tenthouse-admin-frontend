import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '@/Config/Api';
import { 
  Trash2, Printer,
  User, Package, ShoppingBag,
  Eye, X,
  CreditCard, Calendar, Home,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// ============================================================
// TYPES
// ============================================================

// Customer Order (from orders table)
interface CustomerOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerOrder {
  id: number;
  order_number: string;
  user_id: number | null;
  items: CustomerOrderItem[];
  total: string;
  subtotal: string;
  tax: string;
  delivery_charge: string;
  gst: string;
  discount: string;
  status: string;
  delivery_date: string | null;
  event_date: string;
  address: string | null;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_id: number;
  address_label: string;
  address_full_name: string;
  address_phone: string;
  address_line1: string;
  address_line2: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  address_country: string;
  event_time: string;
  event_type: string;
  venue: string;
  guest_count: number;
  special_instructions: string;
  coupon_discount: string;
  coupon_code: string | null;
  grand_total: string;
  order_status: string;
}

// Admin Order (from admin_orders table)
interface AdminOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  price: string;
  discount: string;
  subtotal: string;
  image_url: string;
  created_at: string;
}

interface AdminOrder {
  id: number;
  customer_id: number;
  order_number: string;
  total_amount: string;
  tax_amount: string;
  grand_total: string;
  order_date: string;
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: AdminOrderItem[];
}

type OrderType = 'customer' | 'admin';

// ============================================================
// HELPERS (module-level)
// ============================================================

// Some DB drivers/columns return JSON fields (like `items`) as a raw string
// instead of a parsed array. This normalizes items into a real array no
// matter what shape it comes back in, so .slice()/.map() never blow up.
const normalizeItems = (rawItems: unknown): any[] => {
  if (Array.isArray(rawItems)) return rawItems;

  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeOrder = <T extends { items?: any }>(order: T): T => ({
  ...order,
  items: normalizeItems(order?.items),
});

// ============================================================
// COMPONENT
// ============================================================

const OrdersList: React.FC = () => {
  const [orderType, setOrderType] = useState<OrderType>('customer');
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | AdminOrder | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Get current orders based on type
  const currentOrders = orderType === 'customer' ? customerOrders : adminOrders;

  useEffect(() => {
    fetchOrders();
  }, [orderType]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (orderType === 'customer') {
        const response = await axios.get(`${BASE_URL}/api/customer-orders/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = Array.isArray(response.data?.data) ? response.data.data : [];
        setCustomerOrders(orders.map(normalizeOrder));
      } else {
        const response = await axios.get(`${BASE_URL}/api/orders/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = Array.isArray(response.data?.data) ? response.data.data : [];
        setAdminOrders(orders.map(normalizeOrder));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE STATUS - FIXED
  // ============================================================
 const updateOrderStatus = async (orderId, status) => {
  // Map status to payment status
  let paymentStatus = 'pending';
  if (status === 'completed' || status === 'approved') {
    paymentStatus = 'completed';
  } else if (status === 'cancelled' || status === 'rejected') {
    paymentStatus = 'failed';
  }

  // Optimistic UI update
  const previousCustomerOrders = customerOrders;
  const previousAdminOrders = adminOrders;

  if (orderType === 'customer') {
    setCustomerOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: status, payment_status: paymentStatus } : o)
    );
  } else {
    setAdminOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: status, payment_status: paymentStatus } : o)
    );
  }

  setUpdatingOrderId(orderId);
  try {
    const token = localStorage.getItem('token');

    // Choose endpoint based on order type
    const endpoint = orderType === 'customer'
      ? `${BASE_URL}/api/customer-orders/${orderId}/status-payment`
      : `${BASE_URL}/api/orders/${orderId}/status-payment`;

    // Same payload for both - just status and payment_status
    const payload = { status: status, payment_status: paymentStatus };

    console.log('Sending payload:', payload);

    const response = await axios.put(endpoint, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response:', response.data);

    // Check if the response has the updated data
    if (response.data?.data) {
      const updated = response.data.data;
      const normalizedUpdate = normalizeOrder(updated);
      
      if (orderType === 'customer') {
        setCustomerOrders(prev => 
          prev.map(o => (o.id === orderId ? { ...o, ...normalizedUpdate } : o))
        );
      } else {
        setAdminOrders(prev => 
          prev.map(o => (o.id === orderId ? { ...o, ...normalizedUpdate } : o))
        );
      }
    } else if (response.data?.success) {
      // If success but no data, fetch fresh
      await fetchOrders();
    } else {
      console.error('Unexpected response:', response.data);
      throw new Error('Invalid response from server');
    }

    alert(`Order status updated to ${status.charAt(0).toUpperCase() + status.slice(1)}!`);

  } catch (error) {
    console.error('Error updating order status:', error);
    console.error('Error details:', error.response?.data);
    
    // Roll back optimistic update on failure
    if (orderType === 'customer') {
      setCustomerOrders(previousCustomerOrders);
    } else {
      setAdminOrders(previousAdminOrders);
    }
    alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
  } finally {
    setUpdatingOrderId(null);
  }
};

  // ============================================================
  // DELETE ORDER
  // ============================================================
  const deleteOrder = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');

      const endpoint = orderType === 'customer'
        ? `${BASE_URL}/api/customer-orders/${id}`
        : `${BASE_URL}/api/orders/${id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchOrders();
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const viewInvoice = (order: CustomerOrder | AdminOrder) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const viewOrderDetails = (order: CustomerOrder | AdminOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedOrder(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const formatPrice = (value: string | number): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // For admin orders, image_url is already relative to uploads
    if (imagePath.startsWith('uploads/')) {
      return `http://localhost:5000/${imagePath}`;
    }
    
    if (imagePath.includes('trycloudflare.com')) {
      const match = imagePath.match(/\/uploads\/.+$/);
      if (match) {
        return `http://localhost:5000${match[0]}`;
      }
    }
    
    if (imagePath.includes('localhost:5000')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Default: prepend localhost
    return `http://localhost:5000/uploads/products/${imagePath}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': 
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': 
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'completed':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': 
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders
  const filteredOrders = currentOrders.filter((order: any) => {
    const searchLower = searchTerm.toLowerCase();
    const orderNumber = order.order_number?.toLowerCase() || '';
    const customerName = order.customer_name?.toLowerCase() || '';
    const customerEmail = order.customer_email?.toLowerCase() || '';
    
    const matchSearch = 
      orderNumber.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower) ||
      order.id.toString().includes(searchTerm);
    
    const orderStatus = order.order_status || order.status || 'pending';
    const matchStatus = statusFilter === 'all' || orderStatus === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Get status counts
  const getStatusCount = (status: string) => {
    if (status === 'all') return currentOrders.length;
    return currentOrders.filter((order: any) => {
      const orderStatus = order.order_status || order.status || 'pending';
      return orderStatus === status;
    }).length;
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
 // Update the renderStatusBadge function
const renderStatusBadge = (order: any) => {
  const status = order.status || 'pending'; // Changed from order_status to status
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

  const renderPaymentStatusBadge = (order: any) => {
    const status = order.payment_status || 'pending';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

 // Update the renderStatusActions function
const renderStatusActions = (order: any) => {
  const orderId = order.id;
  const currentStatus = order.status || 'pending'; // Changed from order_status to status
  const isUpdating = updatingOrderId === orderId;

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentStatus}
        onChange={(e) => updateOrderStatus(orderId, e.target.value)}
        disabled={isUpdating}
        className="text-xs border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#0c2d67] disabled:opacity-50 min-w-[100px]"
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      {isUpdating && (
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <RefreshCw size={12} className="animate-spin" /> Updating...
        </span>
      )}
    </div>
  );
};
  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={28} className="text-[#0c2d67]" />
              Orders
            </h1>
            <p className="text-gray-600">Manage all orders</p>
          </div>
          
          <button
            onClick={() => navigate('/admin/create-order')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            New Order
          </button>
        </div>

        {/* Tab Buttons - Customer Orders / Admin Orders */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-lg">
          <button
            onClick={() => setOrderType('customer')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${orderType === 'customer' 
                ? 'bg-[#0c2d67] text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <User size={18} />
            Customer Orders
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              orderType === 'customer' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {customerOrders.length}
            </span>
          </button>
          <button
            onClick={() => setOrderType('admin')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${orderType === 'admin' 
                ? 'bg-[#0c2d67] text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Package size={18} />
            Admin Orders
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
              orderType === 'admin' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {adminOrders.length}
            </span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#0c2d67]">{currentOrders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{getStatusCount('approved')}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order #, customer name or email..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-[#0c2d67] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Loading orders...
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#0c2d67]">{order.order_number}</p>
                          <p className="text-xs text-gray-500">#{order.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{order.items?.length || 0}</span>
                          <span className="text-xs text-gray-500">items</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {order.items?.slice(0, 3).map((item: any, idx: number) => {
                            const imageUrl = item.image || item.image_url;
                            return (
                              <div key={idx} className="w-8 h-8 rounded border overflow-hidden bg-gray-100">
                                {imageUrl ? (
                                  <img 
                                    src={getImageUrl(imageUrl)} 
                                    alt={item.name || item.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 bg-gray-100">
                                    {item.name?.charAt(0) || item.product_name?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {(order.items?.length || 0) > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{(order.items?.length || 0) - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#0c2d67]">
                          ₹{formatPrice(order.grand_total || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Items: ₹{formatPrice(order.subtotal || order.total_amount || 0).toFixed(2)}
                        </div>
                        {order.coupon_code && (
                          <div className="text-xs text-green-600">
                            Coupon: {order.coupon_code}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {renderStatusBadge(order)}
                          {renderStatusActions(order)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderPaymentStatusBadge(order)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at || order.order_date).toLocaleDateString()}
                        <br />
                        <span className="text-xs">{new Date(order.created_at || order.order_date).toLocaleTimeString()}</span>
                        {order.event_date && (
                          <>
                            <br />
                            <span className="text-xs text-gray-400">
                              📅 {new Date(order.event_date).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0c2d67] to-[#1a3f7a] text-white p-6 sticky top-0 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-blue-200">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Order Information */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <User size={16} /> Customer
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Name:</strong> {(selectedOrder as any).customer_name}</p>
                  <p className="text-sm text-gray-800"><strong>Email:</strong> {(selectedOrder as any).customer_email}</p>
                  <p className="text-sm text-gray-800"><strong>Phone:</strong> {(selectedOrder as any).customer_phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar size={16} /> Order Details
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Status:</strong> {(selectedOrder as any).order_status || (selectedOrder as any).status}</p>
                  <p className="text-sm text-gray-800"><strong>Payment:</strong> {(selectedOrder as any).payment_status}</p>
                  <p className="text-sm text-gray-800"><strong>Method:</strong> {(selectedOrder as any).payment_method}</p>
                  {(selectedOrder as any).event_type && (
                    <p className="text-sm text-gray-800"><strong>Event Type:</strong> {(selectedOrder as any).event_type}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <CreditCard size={16} /> Totals
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Grand Total:</strong> ₹{formatPrice((selectedOrder as any).grand_total || 0).toFixed(2)}</p>
                  {(selectedOrder as any).coupon_code && (
                    <p className="text-sm text-gray-800"><strong>Coupon:</strong> {(selectedOrder as any).coupon_code}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Package size={18} /> Order Items
              </h3>
              {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in this order</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedOrder.items as any[]).map((item: any, index: number) => {
                        const imageUrl = item.image || item.image_url;
                        return (
                          <tr key={item.id || index}>
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{item.name || item.product_name}</p>
                              {item.product_code && (
                                <p className="text-xs text-gray-400">Code: {item.product_code}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {imageUrl ? (
                                <img 
                                  src={getImageUrl(imageUrl)} 
                                  alt={item.name || item.product_name}
                                  className="w-12 h-12 object-cover rounded border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                  No img
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{formatPrice(item.price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{(formatPrice(item.price) * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t flex flex-wrap gap-4 justify-end bg-gray-50">
              <button
                onClick={() => {
                  closeDetailsModal();
                  viewInvoice(selectedOrder);
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Printer size={18} /> View Invoice
              </button>
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-[#0c2d67] to-[#1a3f7a] text-white p-6 sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">🏪 TentHouse</h1>
                  <p className="text-blue-200 mt-1">123 Business Street, City</p>
                  <p className="text-blue-200">Email: info@tenthouse.com</p>
                  <p className="text-blue-200">Phone: +91 98765 43210</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold">INVOICE</h2>
                  <p className="text-lg mt-2">{selectedOrder.order_number}</p>
                  <p className="text-blue-200">Date: {new Date((selectedOrder as any).created_at || (selectedOrder as any).order_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <User size={18} /> Customer Details
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-800"><strong>Name:</strong> {(selectedOrder as any).customer_name}</p>
                    <p className="text-gray-800"><strong>Email:</strong> {(selectedOrder as any).customer_email}</p>
                    <p className="text-gray-800"><strong>Phone:</strong> {(selectedOrder as any).customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar size={18} /> Order Details
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-800"><strong>Order #:</strong> {selectedOrder.order_number}</p>
                    <p className="text-gray-800"><strong>Status:</strong> {(selectedOrder as any).order_status || (selectedOrder as any).status}</p>
                    <p className="text-gray-800"><strong>Payment:</strong> {(selectedOrder as any).payment_status}</p>
                    {(selectedOrder as any).event_type && (
                      <p className="text-gray-800"><strong>Event:</strong> {(selectedOrder as any).event_type}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
              {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in this order</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedOrder.items as any[]).map((item: any, index: number) => {
                        const imageUrl = item.image || item.image_url;
                        return (
                          <tr key={item.id || index}>
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{item.name || item.product_name}</p>
                                {item.product_code && (
                                  <p className="text-xs text-gray-400">Code: {item.product_code}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {imageUrl ? (
                                <img 
                                  src={getImageUrl(imageUrl)} 
                                  alt={item.name || item.product_name}
                                  className="w-12 h-12 object-cover rounded border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                  No img
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{formatPrice(item.price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{(formatPrice(item.price) * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-end">
                  <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>₹{formatPrice((selectedOrder as any).subtotal || (selectedOrder as any).total_amount || 0).toFixed(2)}</span>
                    </div>
                    {(selectedOrder as any).delivery_charge && (
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge:</span>
                        <span>₹{formatPrice((selectedOrder as any).delivery_charge).toFixed(2)}</span>
                      </div>
                    )}
                    {(selectedOrder as any).gst && (
                      <div className="flex justify-between text-gray-600">
                        <span>GST:</span>
                        <span>₹{formatPrice((selectedOrder as any).gst).toFixed(2)}</span>
                      </div>
                    )}
                    {(selectedOrder as any).tax_amount && (
                      <div className="flex justify-between text-gray-600">
                        <span>Tax:</span>
                        <span>₹{formatPrice((selectedOrder as any).tax_amount).toFixed(2)}</span>
                      </div>
                    )}
                    {(selectedOrder as any).coupon_discount && formatPrice((selectedOrder as any).coupon_discount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({(selectedOrder as any).coupon_code}):</span>
                        <span>-₹{formatPrice((selectedOrder as any).coupon_discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-[#0c2d67] pt-2 border-t-2 border-dashed">
                      <span>Grand Total:</span>
                      <span>₹{formatPrice((selectedOrder as any).grand_total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 text-center border-t">
              <p className="text-gray-600">Thank you for your business!</p>
              <p className="text-gray-400 text-sm mt-1">This is a system generated invoice.</p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t flex flex-wrap gap-4 justify-end bg-gray-50">
              <button
                onClick={handlePrintInvoice}
                className="px-6 py-2 bg-[#0c2d67] text-white rounded-lg hover:bg-[#1a3f7a] transition-colors flex items-center gap-2"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={closeInvoiceModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;