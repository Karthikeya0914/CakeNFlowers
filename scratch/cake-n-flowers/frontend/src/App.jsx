import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import AuthModal from './components/auth/AuthModal';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AccountPage from './pages/AccountPage';
import OccasionsPage from './pages/OccasionsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-boutique-cream font-sans selection:bg-boutique-blush selection:text-boutique-charcoal">
            <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmed" element={<OrderConfirmationPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/account" element={<AccountPage onOpenAuthModal={() => setAuthModalOpen(true)} />} />
                <Route path="/occasions" element={<OccasionsPage />} />
                <Route path="/admin" element={<AdminDashboard onOpenAuthModal={() => setAuthModalOpen(true)} />} />
              </Routes>
            </main>

            <Footer />
            <CartDrawer />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
