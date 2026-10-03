import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  Star,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ToastContainer } from '../ui/ToastContainer';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: FolderTree },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { name: 'Discounts', path: '/admin/discounts', icon: Tag },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login?redirect=/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] flex font-sans antialiased">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#141F16] text-[#FAF8F5] flex flex-col justify-between border-r border-[#253828] transition-transform duration-300 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#253828] flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-medium tracking-[0.2em] uppercase text-[#FAF8F5]">
                MOSS
              </span>
              <span className="text-[10px] tracking-widest text-[#C4924A] uppercase font-mono px-1.5 py-0.5 bg-sand-900 border border-gold-500/40">
                ADMIN
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-sand-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors',
                    isActive
                      ? 'bg-moss-800 text-[#FAF8F5] font-semibold border-l-2 border-[#C4924A]'
                      : 'text-sand-300 hover:bg-moss-900 hover:text-white'
                  )}
                >
                  <item.icon className="w-4 h-4 text-sand-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#253828] space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between p-2.5 bg-moss-900/80 hover:bg-moss-800 text-xs text-sand-200 transition-colors border border-moss-700"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sand-400" />
          </Link>

          <div className="px-2 text-[10px] text-sand-400">
            <span>MOSS Commerce v2.6.0 (Magento-Ready)</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Navbar */}
        <header className="h-16 bg-[#FAF8F5] border-b border-sand-300 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-charcoal-700 hover:text-charcoal-900"
              aria-label="Open admin sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-widest text-charcoal-500 font-semibold hidden sm:inline">
              MOSS Master Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              className="text-xs text-charcoal-600 hover:text-moss-900 underline underline-offset-4 hidden sm:inline"
            >
              Preview Storefront
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-sand-300">
              <div className="w-8 h-8 rounded-full bg-moss-900 text-sand-50 flex items-center justify-center font-serif text-sm font-semibold">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="text-xs hidden md:block">
                <p className="font-semibold text-charcoal-900 leading-none">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <span className="text-[10px] text-charcoal-500">Store Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
