import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '@/Config/Api';
import { 
  Trash2, ChevronDown, ChevronUp, FileText, Printer,
  User, Mail, Phone, Package, ShoppingBag,
  CheckCircle, XCircle, Clock, RefreshCw, Eye, X,
  CreditCard
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  price: string | number;
  discount: string | number;
  subtotal: string | number;
  created_at: string;
  image_url?: string | null;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_number: string;
  total_amount: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  order_date: string;
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
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
      const response = await axios.get(`${BASE_URL}/api/orders`, {
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

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Get status counts
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
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
              Orders
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th> */}
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
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
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
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{order.items.length}</span>
                            <span className="text-xs text-gray-500">items</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-6 h-6 rounded border overflow-hidden bg-gray-100">
                                {item.image_url ? (
                                  <img 
                                    src={`${BASE_URL}/${item.image_url}`} 
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 bg-gray-100">
                                    {item.product_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">+{order.items.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#0c2d67]">
                          ₹{formatPrice(order.grand_total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.order_date).toLocaleDateString()}
                          <br />
                          <span className="text-xs">{new Date(order.order_date).toLocaleTimeString()}</span>
                        </td>
                        {/* <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td> */}
                        {/* <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                          <br />
                          <span className="text-xs text-gray-400">{order.payment_method}</span>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {/* View Details Button */}
                            {/* <button
                              onClick={() => viewOrderDetails(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Order Details"
                            >
                              <Eye size={18} />
                            </button> */}
                            {/* View Invoice Button */}
                            {/* <button
                              onClick={() => viewInvoice(order)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Invoice"
                            >
                              <FileText size={18} />
                            </button> */}
                            {/* Expand Button */}
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Expand Items"
                            >
                              {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {/* Delete Button */}
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
                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Package size={16} /> Order Items
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-gray-600 border-b">
                                      <th className="text-left py-2">#</th>
                                      <th className="text-left py-2">Product</th>
                                      <th className="text-left py-2">Image</th>
                                      <th className="text-left py-2">Code</th>
                                      <th className="text-left py-2">Qty</th>
                                      <th className="text-right py-2">Price</th>
                                      <th className="text-right py-2">Discount</th>
                                      <th className="text-right py-2">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, index) => (
                                      <tr key={item.id} className="border-t border-gray-200">
                                        <td className="py-2 text-gray-500">{index + 1}</td>
                                        <td className="py-2 font-medium">{item.product_name}</td>
                                        <td className="py-2">
                                          {item.image_url ? (
                                            <img 
                                              src={`${BASE_URL}/${item.image_url}`} 
                                              alt={item.product_name}
                                              className="w-10 h-10 object-cover rounded border"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                              }}
                                            />
                                          ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                              No img
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 text-gray-500">{item.product_code}</td>
                                        <td className="py-2">{item.quantity}</td>
                                        <td className="py-2 text-right">₹{formatPrice(item.price).toFixed(2)}</td>
                                        <td className="py-2 text-right text-red-500">{formatPrice(item.discount)}%</td>
                                        <td className="py-2 text-right font-medium">₹{formatPrice(item.subtotal).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300 font-bold">
                                      <td colSpan={6} className="py-2 text-right">Subtotal:</td>
                                      <td className="py-2 text-right" colSpan={2}>₹{formatPrice(order.total_amount).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={6} className="py-2 text-right text-gray-600">Tax (18%):</td>
                                      <td className="py-2 text-right text-gray-600" colSpan={2}>₹{formatPrice(order.tax_amount).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-300">
                                      <td colSpan={6} className="py-2 text-right text-lg font-bold text-[#0c2d67]">Grand Total:</td>
                                      <td className="py-2 text-right text-lg font-bold text-[#0c2d67]" colSpan={2}>₹{formatPrice(order.grand_total).toFixed(2)}</td>
                                    </tr>
                                  </tbody>
                                </table>
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
                    <Package size={16} /> Order Info
                  </h3>
                  <p className="text-sm text-gray-800"><strong>Order #:</strong> {selectedOrder.order_number}</p>
                  <p className="text-sm text-gray-800"><strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</p>
                  <p className="text-sm text-gray-800"><strong>Items:</strong> {selectedOrder.items.length}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <CreditCard size={16} /> Payment
                  </h3>
                  <p className="text-sm text-gray-800">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Payment:</strong>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                      {selectedOrder.payment_status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800"><strong>Method:</strong> {selectedOrder.payment_method}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Package size={18} /> Order Items
              </h3>
              {selectedOrder.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in this order</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{item.product_name}</p>
                          </td>
                          <td className="px-4 py-3">
                            {item.image_url ? (
                              <img 
                                src={`${BASE_URL}/${item.image_url}`} 
                                alt={item.product_name}
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
                          <td className="px-4 py-3 text-sm text-gray-500">{item.product_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{formatPrice(item.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-red-500 text-right">{formatPrice(item.discount)}%</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{formatPrice(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-right font-medium text-gray-600">Subtotal:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium">₹{formatPrice(selectedOrder.total_amount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-right font-medium text-gray-600">Tax (18%):</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium">₹{formatPrice(selectedOrder.tax_amount).toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={6} className="px-4 py-3 text-right font-bold text-lg text-[#0c2d67]">Grand Total:</td>
                        <td colSpan={2} className="px-4 py-3 text-right font-bold text-lg text-[#0c2d67]">₹{formatPrice(selectedOrder.grand_total).toFixed(2)}</td>
                      </tr>
                    </tfoot>
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
                <FileText size={18} /> View Invoice
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
                  <p className="text-blue-200">Date: {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                  <p className="text-blue-200">Status: <span className="uppercase">{selectedOrder.status}</span></p>
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
                <div className="text-right">
                  <h3 className="font-semibold text-gray-700">Order Details</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-800"><strong>Order #:</strong> {selectedOrder.order_number}</p>
                    <p className="text-gray-800"><strong>Status:</strong> <span className="text-green-600 uppercase">{selectedOrder.status}</span></p>
                    <p className="text-gray-800"><strong>Payment:</strong> <span className={`uppercase ${selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.payment_status}
                    </span></p>
                    <p className="text-gray-800"><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
              {selectedOrder.items.length === 0 ? (
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{item.product_code}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.image_url ? (
                              <img 
                                src={`${BASE_URL}/${item.image_url}`} 
                                alt={item.product_name}
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
                          <td className="px-4 py-3 text-sm text-red-500 text-right">{formatPrice(item.discount)}%</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{formatPrice(item.subtotal).toFixed(2)}</td>
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
                      <span>₹{formatPrice(selectedOrder.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (18%):</span>
                      <span>₹{formatPrice(selectedOrder.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-[#0c2d67] pt-2 border-t-2 border-dashed">
                      <span>Grand Total:</span>
                      <span>₹{formatPrice(selectedOrder.grand_total).toFixed(2)}</span>
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