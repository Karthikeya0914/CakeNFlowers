import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cnf_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('cnf_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [deliverySlot, setDeliverySlot] = useState('Standard (1:00 PM - 6:00 PM)');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow by default
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('cnf_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('cnf_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('cnf_coupon');
    }
  }, [coupon]);

  const addToCart = (productData) => {
    const cartId = `${productData.productId}_${productData.variantId || 'base'}_${Date.now()}`;
    const newItem = {
      cartId,
      productId: productData.productId,
      name: productData.name,
      price: productData.price,
      image: productData.image,
      variantId: productData.variantId || null,
      variantName: productData.variantName || null,
      quantity: productData.quantity || 1,
      customFlavor: productData.customFlavor || null,
      customInscription: productData.customInscription || null,
      customMessageCard: productData.customMessageCard || null,
      customPhotoUrl: productData.customPhotoUrl || null,
      isEggless: Boolean(productData.isEggless)
    };

    setItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('cnf_cart');
    localStorage.removeItem('cnf_coupon');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateDeliveryFee = (slot, amount) => {
    if (!slot) return 5.0;
    const lower = slot.toLowerCase();
    if (lower.includes('midnight')) return 12.0;
    if (lower.includes('express')) return 8.0;
    if (amount >= 70.0) return 0.0;
    return 5.0;
  };

  const deliveryFee = items.length > 0 ? calculateDeliveryFee(deliverySlot, subtotal) : 0;

  const applyCoupon = async (code) => {
    const res = await api.post('/coupons/validate', { code, subtotal });
    if (res.valid) {
      setCoupon({
        code: res.code,
        discount: res.discount,
        discountType: res.discountType,
        discountValue: res.discountValue
      });
      return res;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Compute live discount
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(((subtotal * coupon.discountValue) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, Math.round((subtotal + deliveryFee - discountAmount) * 100) / 100);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    coupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    deliveryDate,
    setDeliveryDate,
    deliverySlot,
    setDeliverySlot,
    deliveryFee,
    subtotal: Math.round(subtotal * 100) / 100,
    total,
    itemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
