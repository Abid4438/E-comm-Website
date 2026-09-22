import React, { useState, useEffect } from 'react';
import { customerService, orderService } from '../../services/apiClient';
import { Customer } from '../../types/customer';
import { Order } from '../../types/order';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Search, Eye, Mail, Phone, MapPin } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenCustomer = async (c: Customer) => {
    setSelectedCustomer(c);
    try {
      const ords = await orderService.getCustomerOrders(c.id);
      setCustomerOrders(ords);
    } catch {
      setCustomerOrders([]);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Client Relations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
          Customers ({customers.length})
        </h1>
      </div>

      {/* Search */}
      <div className="p-4 bg-[#FAF8F5] border border-sand-300 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-white border border-sand-300 pl-9 pr-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Member Since</th>
                <th className="p-3.5">Tier</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sand-300 text-charcoal-900 flex items-center justify-center font-serif text-sm font-semibold">
                          {c.firstName[0]}
                        </div>
                        <span className="font-semibold text-charcoal-900">
                          {c.firstName} {c.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">{c.email}</td>
                    <td className="p-3.5">{c.totalOrders} orders</td>
                    <td className="p-3.5 font-medium text-charcoal-900">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="p-3.5">{formatDate(c.registeredAt)}</td>
                    <td className="p-3.5">
                      <Badge variant={c.status === 'VIP' ? 'vip' : 'ORGANIC'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenCustomer(c)}
                        className="inline-flex items-center gap-1 text-xs text-moss-900 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
          subtitle={`Client Account: ${selectedCustomer.email}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-sand-100 border border-sand-300 text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold">
                  Status
                </span>
                <p className="font-serif text-lg font-medium text-charcoal-900 mt-0.5">
                  {selectedCustomer.status}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold">
                  Lifetime Curations
                </span>
                <p className="font-serif text-lg font-medium text-charcoal-900 mt-0.5">
                  {selectedCustomer.totalOrders} Orders
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold">
                  Total Volume
                </span>
                <p className="font-serif text-lg font-medium text-charcoal-900 mt-0.5">
                  {formatPrice(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs text-charcoal-700">
              <h4 className="uppercase tracking-wider font-semibold text-charcoal-900">
                Contact & Shipping Details
              </h4>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-moss-800" />
                <span>{selectedCustomer.email}</span>
              </p>
              {selectedCustomer.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-moss-800" />
                  <span>{selectedCustomer.phone}</span>
                </p>
              )}
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-moss-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Primary Address: </span>
                    <span>
                      {selectedCustomer.addresses[0].addressLine1},{' '}
                      {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state}{' '}
                      {selectedCustomer.addresses[0].postalCode}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Order history */}
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <h4 className="uppercase tracking-wider font-semibold text-xs text-charcoal-900">
                Recent Orders
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-charcoal-500">No recent orders recorded.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-sand-100/60 border border-sand-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-medium text-charcoal-900">{ord.id}</span>
                        <span className="text-charcoal-400 ml-2">· {formatDate(ord.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={ord.status} />
                        <span className="font-medium text-charcoal-900">{formatPrice(ord.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
