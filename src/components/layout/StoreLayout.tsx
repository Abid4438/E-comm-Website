import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { ToastContainer } from '../ui/ToastContainer';
import { useAuthStore } from '../../store/useAuthStore';

export const StoreLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1A1A] font-sans antialiased selection:bg-[#253828] selection:text-[#FAF8F5]">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <ToastContainer />
    </div>
  );
};
