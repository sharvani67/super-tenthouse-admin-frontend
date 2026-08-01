import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Truck,
  PackageCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

interface Order {
  id: number;
  order_number: string;
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
  event_date: string;
  event_time: string;
  event_type: string;
  venue: string;
  guest_count: number;
  special_instructions: string;
  items: any;
  subtotal: number;
  delivery_charge: number;
  gst: number;
  coupon_discount: number;
  coupon_code: string;
  grand_total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  status: string;
  order_status: 'pending' | 'confirmed' | 'team_assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
  id?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('📦 Fetching orders from:', `${API_BASE_URL}/api/checkout/orders/all`);
      console.log('📦 Using token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_BASE_URL}/api/checkout/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📦 Orders response status:', response.status);
      console.log('📦 Orders response data:', response.data);

      if (response.data.success) {
        // Map the data to ensure order_status is available
        const ordersWithStatus = response.data.data.map((order: any) => ({
          ...order,
          order_status: order.order_status || order.status || 'pending',
          // Ensure items is parsed
          items: typeof order.items === 'string' ? JSON.parse(order.items || '[]') : order.items || []
        }));
        setOrders(ordersWithStatus);
        setError(null);
        console.log('✅ Orders loaded:', ordersWithStatus.length);
      } else {
        setError('Failed to fetch orders: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      
      let errorMessage = 'Error fetching orders';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login again');
        return;
      }

      console.log('📦 Updating order status:', orderId, 'to:', newStatus);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/checkout/order/${orderId}/status`,
        { orderStatus: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📦 Update response:', response.data);

      if (response.data.success) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus as Order['order_status'] } : null);
        }
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('❌ Error updating order status:', err);
      alert('Failed to update order status: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  // Test database connection
  const testDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/checkout/test-db`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('📦 Database test result:', response.data);
      alert(`Database connected: ${response.data.connected}\nTotal orders: ${response.data.totalOrders}`);
    } catch (err) {
      console.error('❌ Database test failed:', err);
      alert('Database test failed. Check console for details.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Toggle row expansion
  const toggleRow = (orderId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      team_assigned: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      in_progress: { color: 'bg-indigo-100 text-indigo-800', icon: PackageCheck },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Payment status badge
  const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[status] || config.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Parse items safely
  const parseItems = (items: any): OrderItem[] => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        return JSON.parse(items || '[]');
      } catch {
        return [];
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-semibold">Error loading orders</p>
          <p className="text-sm mt-2">{error}</p>
          <div className="mt-4 flex flex-col items-center space-y-2">
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
            <button 
              onClick={testDatabase}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              Test Database
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage all customer orders</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Total: <strong>{filteredOrders.length}</strong> orders
            </span>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button 
              onClick={testDatabase}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
            >
              Test DB
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order #, customer, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="team_assigned">Team Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payment</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <PackageCheck className="w-12 h-12 text-gray-300 mb-2" />
                        <p>No orders found</p>
                        <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers place orders.</p>
                        <button 
                          onClick={fetchOrders}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleRow(order.id)}
                              className="mr-2 text-gray-400 hover:text-gray-600"
                            >
                              {expandedRows[order.id] ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{order.order_number}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.customer_email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.event_type || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {order.event_date && new Date(order.event_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{Number(order.grand_total).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {parseItems(order.items).length} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.order_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentBadge status={order.payment_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                      {expandedRows[order.id] && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Delivery Address</h4>
                                <p className="text-sm text-gray-600">
                                  {order.address_full_name}<br />
                                  {order.address_line1}<br />
                                  {order.address_line2 && `${order.address_line2}<br />`}
                                  {order.address_city}, {order.address_state}<br />
                                  {order.address_pincode}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Event Details</h4>
                                <p className="text-sm text-gray-600">
                                  <strong>Type:</strong> {order.event_type || 'N/A'}<br />
                                  <strong>Date:</strong> {order.event_date && new Date(order.event_date).toLocaleDateString()}<br />
                                  <strong>Time:</strong> {order.event_time || 'N/A'}<br />
                                  <strong>Guests:</strong> {order.guest_count || 'N/A'}<br />
                                  <strong>Venue:</strong> {order.venue || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Order Summary</h4>
                                <p className="text-sm text-gray-600">
                                  <strong>Subtotal:</strong> ₹{Number(order.subtotal).toFixed(2)}<br />
                                  <strong>Delivery:</strong> ₹{Number(order.delivery_charge).toFixed(2)}<br />
                                  <strong>GST:</strong> ₹{Number(order.gst).toFixed(2)}<br />
                                  {order.coupon_discount > 0 && (
                                    <><strong>Discount:</strong> -₹{Number(order.coupon_discount).toFixed(2)}<br /></>
                                  )}
                                  <strong className="text-blue-600">Total:</strong> ₹{Number(order.grand_total).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {selectedOrder.customer_name || 'N/A'}<br />
                    <strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}<br />
                    <strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.address_full_name}<br />
                    {selectedOrder.address_line1}<br />
                    {selectedOrder.address_line2 && `${selectedOrder.address_line2}<br />`}
                    {selectedOrder.address_city}, {selectedOrder.address_state}<br />
                    {selectedOrder.address_pincode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Event Details</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Type:</strong> {selectedOrder.event_type || 'N/A'}<br />
                    <strong>Date:</strong> {selectedOrder.event_date && new Date(selectedOrder.event_date).toLocaleDateString()}<br />
                    <strong>Time:</strong> {selectedOrder.event_time || 'N/A'}<br />
                    <strong>Guests:</strong> {selectedOrder.guest_count || 'N/A'}<br />
                    <strong>Venue:</strong> {selectedOrder.venue || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Order Status</label>
                      <select
                        value={selectedOrder.order_status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="team_assigned">Team Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Payment Status</label>
                      <PaymentBadge status={selectedOrder.payment_status} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Payment Details</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Method:</strong> {selectedOrder.payment_method || 'N/A'}<br />
                    <strong>Subtotal:</strong> ₹{Number(selectedOrder.subtotal).toFixed(2)}<br />
                    <strong>Delivery:</strong> ₹{Number(selectedOrder.delivery_charge).toFixed(2)}<br />
                    <strong>GST:</strong> ₹{Number(selectedOrder.gst).toFixed(2)}<br />
                    {selectedOrder.coupon_discount > 0 && (
                      <><strong>Discount:</strong> -₹{Number(selectedOrder.coupon_discount).toFixed(2)}<br /></>
                    )}
                    <strong className="text-blue-600">Grand Total:</strong> ₹{Number(selectedOrder.grand_total).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parseItems(selectedOrder.items).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">₹{Number(item.price).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{Number(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.special_instructions}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;