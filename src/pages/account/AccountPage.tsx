import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { orderService, customerService } from '../../services/apiClient';
import { Order } from '../../types/order';
import { Address } from '../../types/customer';
import { formatPrice, formatDate } from '../../utils/formatters';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToastStore } from '../../store/useToastStore';
import {
  Package,
  MapPin,
  User,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  Eye,
  Shield,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Address Form
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  // Profile Form
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || '');
  const [profileLastName, setProfileLastName] = useState(user?.lastName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login?redirect=/account');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user) {
      setProfileFirstName(user.firstName);
      setProfileLastName(user.lastName);
      setProfilePhone(user.phone);

      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const res = await orderService.getCustomerOrders(user.id);
          setOrders(res);
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    showToast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
    navigate('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await customerService.updateProfile(user.id, {
        firstName: profileFirstName,
        lastName: profileLastName,
        phone: profilePhone,
      });
      await refreshUser();
      showToast({
        title: 'Profile Updated',
        message: 'Your personal information has been saved.',
        type: 'success',
      });
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not update profile.',
        type: 'error',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) {
      showToast({ title: 'Missing Information', message: 'Please fill all required fields.', type: 'error' });
      return;
    }

    try {
      await customerService.addAddress(user.id, newAddress);
      await refreshUser();
      setIsAddressModalOpen(false);
      setNewAddress({
        firstName: user.firstName,
        lastName: user.lastName,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: user.phone,
        isDefault: false,
      });
      showToast({
        title: 'Address Added',
        message: 'New shipping address added to your profile.',
        type: 'success',
      });
    } catch {
      showToast({ title: 'Error', message: 'Could not add address.', type: 'error' });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await customerService.deleteAddress(user.id, addressId);
      await refreshUser();
      showToast({
        title: 'Address Removed',
        message: 'Address has been deleted.',
        type: 'info',
      });
    } catch {
      showToast({ title: 'Error', message: 'Could not delete address.', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <SEOHead title="My Account | MOSS" description="Manage your MOSS account and orders." />

      {/* Header Profile Title */}
      <div className="pb-8 border-b border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-xs text-charcoal-500 font-light mt-1">
            Member since {formatDate(user.registeredAt)} · {user.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link to="/admin">
              <Button variant="moss" size="sm">
                Admin Console
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Account Tabs & Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0 border-b lg:border-b-0 border-sand-200">
            {[
              { id: 'overview', label: 'Account Overview', icon: User },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
              { id: 'addresses', label: `Addresses (${user.addresses?.length || 0})`, icon: MapPin },
              { id: 'profile', label: 'Profile Details', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-medium text-left transition-all shrink-0',
                  activeTab === tab.id
                    ? 'bg-sand-200/80 text-moss-900 border-l-2 border-moss-900 font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-9">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-[#FAF8F5] border border-sand-200">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold">
                    Client Status
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-serif text-2xl text-charcoal-900 font-medium">
                      {user.status || 'Active Member'}
                    </span>
                    <Badge variant={user.status === 'VIP' ? 'vip' : 'ORGANIC'} />
                  </div>
                </div>

                <div className="p-6 bg-[#FAF8F5] border border-sand-200">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold">
                    Total Orders
                  </span>
                  <div className="mt-2 font-serif text-3xl text-charcoal-900 font-medium">
                    {orders.length}
                  </div>
                </div>

                <div className="p-6 bg-[#FAF8F5] border border-sand-200">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold">
                    Curations Investment
                  </span>
                  <div className="mt-2 font-serif text-3xl text-charcoal-900 font-medium">
                    {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-6 bg-[#FAF8F5] border border-sand-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-charcoal-900 font-medium">
                    Recent Order
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-moss-900 font-semibold underline underline-offset-4"
                  >
                    View All
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="p-4 bg-sand-100/70 border border-sand-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-semibold text-charcoal-900">
                          {orders[0].id}
                        </span>
                        <Badge variant={orders[0].status} />
                      </div>
                      <p className="text-xs text-charcoal-500 mt-1">
                        Placed on {formatDate(orders[0].date)} · {orders[0].items.length} items · {formatPrice(orders[0].total)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(orders[0])}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-charcoal-500">You haven't placed any orders yet.</p>
                )}
              </div>

              {/* Default Address */}
              <div className="p-6 bg-[#FAF8F5] border border-sand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-charcoal-900 font-medium">
                    Default Shipping Destination
                  </h3>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="text-xs text-moss-900 font-semibold underline underline-offset-4"
                  >
                    Manage
                  </button>
                </div>

                {user.addresses && user.addresses.length > 0 ? (
                  <div className="text-xs text-charcoal-700 leading-relaxed font-light">
                    <p className="font-semibold text-charcoal-900">
                      {user.addresses[0].firstName} {user.addresses[0].lastName}
                    </p>
                    <p>{user.addresses[0].addressLine1}</p>
                    <p>
                      {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].postalCode}
                    </p>
                    <p>{user.addresses[0].country}</p>
                  </div>
                ) : (
                  <p className="text-xs text-charcoal-500">No saved address yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                  Order History
                </h3>
                <span className="text-xs text-charcoal-500">
                  {orders.length} lifetime curations
                </span>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 text-center text-xs uppercase tracking-widest text-charcoal-500">
                  Loading order history...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center bg-[#FAF8F5] border border-sand-200">
                  <Package className="w-8 h-8 text-charcoal-400 mx-auto mb-2 stroke-1" />
                  <p className="font-serif text-xl text-charcoal-900 mb-1">No Orders Found</p>
                  <p className="text-xs text-charcoal-500 mb-6">
                    You have not placed any orders with MOSS yet.
                  </p>
                  <Link to="/shop">
                    <Button variant="dark" size="sm">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-6 bg-[#FAF8F5] border border-sand-200 hover:border-sand-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-semibold text-charcoal-900">
                              Order #{ord.id}
                            </span>
                            <Badge variant={ord.status} />
                          </div>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            Placed on {formatDate(ord.date)} · Paid with {ord.paymentMethod}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-serif text-lg font-medium text-charcoal-900 block">
                            {formatPrice(ord.total)}
                          </span>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 text-xs text-moss-900 font-medium hover:underline mt-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details & Receipt</span>
                          </button>
                        </div>
                      </div>

                      {/* Items thumbnails preview */}
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {ord.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-14 object-cover bg-sand-200 border border-sand-300"
                            />
                            <div className="text-[11px] text-charcoal-700">
                              <p className="font-medium truncate max-w-[120px]">{item.product.name}</p>
                              <p className="text-charcoal-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                    Saved Addresses
                  </h3>
                  <p className="text-xs text-charcoal-500 font-light mt-0.5">
                    Manage your shipping locations for fast, seamless checkout.
                  </p>
                </div>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Address
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-6 bg-[#FAF8F5] border border-sand-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-xs text-charcoal-900">
                          {addr.firstName} {addr.lastName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-moss-800 bg-moss-50 px-2 py-0.5 border border-moss-200">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-charcoal-600 space-y-1 font-light">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p>{addr.country}</p>
                        <p className="pt-2 text-charcoal-400">{addr.phone}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-sand-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="inline-flex items-center gap-1 text-xs text-charcoal-400 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div>
                <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                  Personal Information
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Update your account contact details.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-sand-200/50 border border-sand-300 p-3 text-xs text-charcoal-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+1 (555) 234-8901"
                    className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="dark"
                    size="md"
                    isLoading={isSavingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          subtitle={`Placed on ${formatDate(selectedOrder.date)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sand-200">
              <div>
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block">
                  Status
                </span>
                <div className="mt-1">
                  <Badge variant={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block">
                  Carrier Tracking
                </span>
                <span className="text-xs font-mono font-medium text-charcoal-900">
                  {selectedOrder.trackingNumber || 'Pending pickup'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-sand-200">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover bg-sand-200 border border-sand-300"
                    />
                    <div>
                      <h4 className="font-serif text-base text-charcoal-900 font-medium">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-charcoal-500">
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

            {/* Total Breakdown */}
            <div className="p-4 bg-sand-100/80 border border-sand-200 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Shipping</span>
                <span>{selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping)}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Tax</span>
                <span>{formatPrice(selectedOrder.tax)}</span>
              </div>
              <div className="pt-2 border-t border-sand-300 flex justify-between font-semibold text-sm text-charcoal-900">
                <span>Total Paid</span>
                <span className="font-serif text-xl">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD ADDRESS MODAL */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Shipping Address"
        maxWidth="md"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={newAddress.firstName}
                onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={newAddress.lastName}
                onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="set-default"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
              className="rounded text-moss-900"
            />
            <label htmlFor="set-default" className="text-xs text-charcoal-700">
              Set as primary shipping address
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="dark" size="md">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
