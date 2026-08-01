import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '@/Config/Api';
import { 
  Trash2, Printer,
  User, Package, ShoppingBag,
  Eye, X,
  CreditCard, MapPin, Calendar, Home
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  items: OrderItem[];
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

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/customer-orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchOrders();
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const viewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const viewOrderDetails = (order: Order) => {
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

  // Helper function to format price
  const formatPrice = (value: string | number): number => {
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  // Helper function to get image URL - replace cloudflare with localhost
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // Replace cloudflare URLs with localhost
    if (imagePath.includes('trycloudflare.com')) {
      // Extract the path after /uploads/
      const match = imagePath.match(/\/uploads\/.+$/);
      if (match) {
        return `http://localhost:5000${match[0]}`;
      }
    }
    
    // If it's already a localhost URL, return as is
    if (imagePath.includes('localhost:5000')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend localhost
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // If it starts with http but not cloudflare, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Default: prepend localhost
    return `http://localhost:5000/uploads/products/${imagePath}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Get status counts
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.order_status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={28} className="text-[#0c2d67]" />
              Customer Orders
            </h1>
            <p className="text-gray-600">Manage all customer orders</p>
          </div>
          
          <button
            onClick={() => navigate('/admin/create-order')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#0c2d67]">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{getStatusCount('processing')}</p>
            <p className="text-sm text-gray-500">Processing</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{getStatusCount('completed')}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{getStatusCount('cancelled')}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
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
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Loading orders...
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
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
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-8 h-8 rounded border overflow-hidden bg-gray-100">
                              {item.image ? (
                                <img 
                                  src={getImageUrl(item.image)} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 bg-gray-100">
                                  {item.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{(order.items?.length || 0) - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#0c2d67]">
                          ₹{formatPrice(order.grand_total).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Items: ₹{formatPrice(order.subtotal).toFixed(2)}
                        </div>
                        {order.coupon_code && (
                          <div className="text-xs text-green-600">
                            Coupon: {order.coupon_code}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{order.event_type}</span>
                          <br />
                          <span className="text-xs text-gray-500">{order.venue}</span>
                          <br />
                          <span className="text-xs text-gray-400">👥 {order.guest_count} guests</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</span>
                        <br />
                        <span className="text-xs text-gray-400">
                          📅 {new Date(order.event_date).toLocaleDateString()}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">
                          🕐 {order.event_time}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {/* View Details Button - Eye icon only */}
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye size={18} />
                          </button>
                          {/* Delete Button - Trash icon only */}
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
                  <p className="text-sm text-gray-800"><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-800"><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p className="text-sm text-gray-800"><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar size={16} /> Event Details
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Type:</strong> {selectedOrder.event_type}</p>
                  <p className="text-sm text-gray-800"><strong>Venue:</strong> {selectedOrder.venue}</p>
                  <p className="text-sm text-gray-800"><strong>Date:</strong> {new Date(selectedOrder.event_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-800"><strong>Time:</strong> {selectedOrder.event_time}</p>
                  <p className="text-sm text-gray-800"><strong>Guests:</strong> {selectedOrder.guest_count}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <CreditCard size={16} /> Payment
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Method:</strong> {selectedOrder.payment_method}</p>
                  <p className="text-sm text-gray-800"><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                  {selectedOrder.coupon_code && (
                    <p className="text-sm text-gray-800"><strong>Coupon:</strong> {selectedOrder.coupon_code}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.address_line1 && (
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Home size={16} /> Delivery Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>{selectedOrder.address_full_name}</strong> ({selectedOrder.address_label})
                    <br />
                    {selectedOrder.address_line1}, {selectedOrder.address_line2}
                    <br />
                    {selectedOrder.address_city}, {selectedOrder.address_state} - {selectedOrder.address_pincode}
                    <br />
                    {selectedOrder.address_country}
                    <br />
                    📞 {selectedOrder.address_phone}
                  </p>
                </div>
              </div>
            )}

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
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{item.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            {item.image ? (
                              <img 
                                src={getImageUrl(item.image)} 
                                alt={item.name}
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">Subtotal:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium">₹{formatPrice(selectedOrder.subtotal).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">Delivery Charge:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium">₹{formatPrice(selectedOrder.delivery_charge).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">GST:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium">₹{formatPrice(selectedOrder.gst).toFixed(2)}</td>
                      </tr>
                      {selectedOrder.coupon_discount && formatPrice(selectedOrder.coupon_discount) > 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right font-medium text-green-600">Coupon Discount:</td>
                          <td colSpan={2} className="px-4 py-3 text-right font-medium text-green-600">-₹{formatPrice(selectedOrder.coupon_discount).toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-lg text-[#0c2d67]">Grand Total:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-bold text-lg text-[#0c2d67]">₹{formatPrice(selectedOrder.grand_total).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {selectedOrder.special_instructions && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h5 className="font-semibold text-gray-700 text-sm">Special Instructions:</h5>
                  <p className="text-sm text-gray-600">{selectedOrder.special_instructions}</p>
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
                  <p className="text-blue-200">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
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
                    <p className="text-gray-800"><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p className="text-gray-800"><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p className="text-gray-800"><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar size={18} /> Event Details
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-800"><strong>Event:</strong> {selectedOrder.event_type}</p>
                    <p className="text-gray-800"><strong>Venue:</strong> {selectedOrder.venue}</p>
                    <p className="text-gray-800"><strong>Date:</strong> {new Date(selectedOrder.event_date).toLocaleDateString()}</p>
                    <p className="text-gray-800"><strong>Time:</strong> {selectedOrder.event_time}</p>
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
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.image ? (
                              <img 
                                src={getImageUrl(item.image)} 
                                alt={item.name}
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
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
                      <span>₹{formatPrice(selectedOrder.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge:</span>
                      <span>₹{formatPrice(selectedOrder.delivery_charge).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST:</span>
                      <span>₹{formatPrice(selectedOrder.gst).toFixed(2)}</span>
                    </div>
                    {selectedOrder.coupon_discount && formatPrice(selectedOrder.coupon_discount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({selectedOrder.coupon_code}):</span>
                        <span>-₹{formatPrice(selectedOrder.coupon_discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-[#0c2d67] pt-2 border-t-2 border-dashed">
                      <span>Grand Total:</span>
                      <span>₹{formatPrice(selectedOrder.grand_total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address_line1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Delivery Address
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOrder.address_full_name} ({selectedOrder.address_label})
                    <br />
                    {selectedOrder.address_line1}, {selectedOrder.address_line2}
                    <br />
                    {selectedOrder.address_city}, {selectedOrder.address_state} - {selectedOrder.address_pincode}
                    <br />
                    {selectedOrder.address_country}
                    <br />
                    📞 {selectedOrder.address_phone}
                  </p>
                </div>
              )}
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