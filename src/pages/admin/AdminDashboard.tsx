import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  orderService,
  productService,
  customerService,
} from '../../services/apiClient';
import { Order } from '../../types/order';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Tag,
  Lock,
  BellRing,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordList, prodList, custList] = await Promise.all([
          orderService.getOrders(),
          productService.getProducts(),
          customerService.getCustomers(),
        ]);
        setOrders(ordList);
        setProducts(prodList);
        setCustomers(custList);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Store Performance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Executive Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products?action=new">
            <Button variant="dark" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </Link>
          <Link to="/admin/discounts">
            <Button variant="outline" size="sm" leftIcon={<Tag className="w-3.5 h-3.5" />}>
              New Promo
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-moss-800" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            {formatPrice(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% this month</span>
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-moss-800" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-charcoal-500">
            Avg: {formatPrice(orders.length ? totalRevenue / orders.length : 0)} / order
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Customers</span>
            <Users className="w-4 h-4 text-moss-800" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            {customers.length}
          </div>
          <div className="text-[11px] text-charcoal-500">
            {customers.filter((c) => c.status === 'VIP').length} VIP Clients
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Active Catalog</span>
            <Package className="w-4 h-4 text-moss-800" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            {products.length}
          </div>
          <div className="text-[11px] text-charcoal-500">Across 4 collections</div>
        </div>

        <div className="p-5 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-amber-700">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            {outOfStockCount > 0 ? `${outOfStockCount} items sold out` : 'Requires restock soon'}
          </div>
        </div>
      </div>

      {/* Sales Overview Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-sand-200">
            <div>
              <h3 className="font-serif text-2xl font-normal text-charcoal-900">
                Revenue & Sales Trajectory
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Monthly revenue volume across online storefront channels
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-moss-900 bg-sand-200 px-3 py-1 border border-sand-300">
              2026 Fiscal
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {[
              { month: 'Apr', amount: 12400, height: 42 },
              { month: 'May', amount: 16800, height: 58 },
              { month: 'Jun', amount: 19200, height: 66 },
              { month: 'Jul', amount: 22500, height: 78 },
              { month: 'Aug', amount: 24800, height: 86 },
              { month: 'Sep', amount: 28900, height: 100 },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-charcoal-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  ${(bar.amount / 1000).toFixed(1)}k
                </div>
                <div
                  className="w-full bg-sand-300 group-hover:bg-moss-900 transition-all duration-300 relative rounded-none"
                  style={{ height: `${bar.height}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#C4924A]" />
                </div>
                <span className="text-xs text-charcoal-600 uppercase tracking-wider font-medium">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications / Audit / Analytics references */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-900 flex items-center gap-2"><BellRing className="w-4 h-4 text-gold-500" /> Notifications</h3>
          <ul className="text-xs space-y-2 text-charcoal-700">
            <li>• Low-stock alert: 3 SKUs under threshold.</li>
            <li>• Order #2481 flagged for refund review.</li>
          </ul>
          <h3 className="font-serif text-xl font-normal text-charcoal-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-moss-800" /> Audit Log</h3>
          <p className="text-[11px] text-charcoal-500">Audit trail and multi-vendor support not fully implemented. Refer to Shopify/Magento-style admin flows for full analytics + audit patterns.</p>
        </div>

        {/* Category Share Breakdown */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-6">
          <h3 className="font-serif text-2xl font-normal text-charcoal-900 pb-4 border-b border-sand-200">
            Collection Share
          </h3>

          <div className="space-y-4 text-xs">
            {[
              { name: 'Home & Ceramics', pct: 38, count: 6, color: 'bg-moss-900' },
              { name: 'Linen Apparel', pct: 28, count: 5, color: 'bg-[#5C7060]' },
              { name: 'Leather & Accessories', pct: 20, count: 5, color: 'bg-[#8E7F61]' },
              { name: 'Everyday Essentials', pct: 14, count: 5, color: 'bg-[#C4924A]' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-charcoal-700">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-mono">{cat.pct}%</span>
                </div>
                <div className="h-2 w-full bg-sand-200 overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-sand-200">
            <Link
              to="/admin/categories"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-moss-900 font-semibold hover:underline"
            >
              <span>Manage Collections</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Management Table */}
      <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-sand-200">
          <div>
            <h3 className="font-serif text-2xl font-normal text-charcoal-900">
              Recent Store Orders
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live orders submitted across all channels
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs uppercase tracking-wider text-moss-900 font-semibold hover:underline"
          >
            View All Orders ({orders.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-sand-100/50 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-charcoal-900">{ord.id}</td>
                  <td className="p-3.5">
                    <span className="font-medium text-charcoal-900">
                      {ord.customer.firstName} {ord.customer.lastName}
                    </span>
                    <span className="block text-[10px] text-charcoal-400">{ord.customer.email}</span>
                  </td>
                  <td className="p-3.5">{formatDate(ord.date)}</td>
                  <td className="p-3.5">{ord.items.length} items</td>
                  <td className="p-3.5 font-medium text-charcoal-900">{formatPrice(ord.total)}</td>
                  <td className="p-3.5">
                    <Badge variant={ord.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-xs text-moss-900 hover:underline font-medium"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
