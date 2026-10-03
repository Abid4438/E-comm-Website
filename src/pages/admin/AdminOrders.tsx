import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/apiClient';
import { Order, OrderStatus } from '../../types/order';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToastStore } from '../../store/useToastStore';
import { Search, Eye } from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('DHL Express');
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToastStore();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setCarrier(ord.carrier || 'DHL Express');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        trackingNumber,
        carrier
      );
      setSelectedOrder(updated);
      showToast({
        title: 'Status Updated',
        message: `Order #${updated.id} status changed to ${newStatus}.`,
        type: 'success',
      });
      loadOrders();
    } catch {
      showToast({ title: 'Error', message: 'Could not update status.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Fulfillment & Processing
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
          Orders ({orders.length})
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#FAF8F5] border border-sand-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or customer..."
            className="w-full bg-white border border-sand-300 pl-9 pr-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs uppercase tracking-wider text-charcoal-500 font-medium">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-sand-300 px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-500">
                    No orders matching filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-3.5 font-mono font-medium text-charcoal-900">{ord.id}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-charcoal-900 block">
                        {ord.customer.firstName} {ord.customer.lastName}
                      </span>
                      <span className="text-[10px] text-charcoal-400">{ord.customer.email}</span>
                    </td>
                    <td className="p-3.5">{formatDate(ord.date)}</td>
                    <td className="p-3.5">{ord.items.length} units</td>
                    <td className="p-3.5">
                      <span className="capitalize">{ord.paymentMethod}</span>
                      <span className="block text-[10px] text-emerald-800 font-medium">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-charcoal-900">{formatPrice(ord.total)}</td>
                    <td className="p-3.5">
                      <Badge variant={ord.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetails(ord)}
                        className="inline-flex items-center gap-1 text-xs text-moss-900 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & STATUS UPDATE MODAL */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Management #${selectedOrder.id}`}
          subtitle={`Received on ${formatDate(selectedOrder.date)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Status update form */}
            <form onSubmit={handleUpdateStatus} className="p-4 bg-sand-100 border border-sand-300 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal-900">
                Update Fulfillment Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-white border border-sand-300 p-2 text-xs text-charcoal-900 focus:outline-none"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="DHL Express"
                    className="w-full bg-white border border-sand-300 p-2 text-xs text-charcoal-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="TRK-..."
                    className="w-full bg-white border border-sand-300 p-2 text-xs font-mono text-charcoal-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="dark" size="sm" isLoading={isUpdating}>
                  Update Status
                </Button>
              </div>
            </form>

            {/* Purchased items list */}
            <div className="divide-y divide-sand-200">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal-900 pb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-14 object-cover bg-sand-200 border border-sand-300"
                    />
                    <div>
                      <h5 className="font-serif text-sm font-semibold text-charcoal-900">
                        {item.product.name}
                      </h5>
                      <p className="text-[11px] text-charcoal-500">
                        {item.selectedColor} · {item.selectedSize} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif text-base font-medium text-charcoal-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping & Financial Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-sand-100/70 border border-sand-200 space-y-1">
                <span className="font-semibold text-charcoal-900 block uppercase tracking-wider">
                  Ship To:
                </span>
                <p>
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>

              <div className="p-4 bg-sand-100/70 border border-sand-200 space-y-1.5">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping:</span>
                  <span>{formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Tax:</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className="pt-2 border-t border-sand-300 flex justify-between font-semibold text-charcoal-900">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
