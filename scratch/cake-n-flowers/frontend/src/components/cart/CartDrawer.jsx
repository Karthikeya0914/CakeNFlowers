import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    coupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    deliveryFee,
    subtotal,
    total,
    deliverySlot,
    setDeliverySlot,
    deliveryDate,
    setDeliveryDate
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-boutique-forest/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-boutique-cream shadow-2xl flex flex-col border-l border-boutique-border">
          {/* Header */}
          <div className="p-6 border-b border-boutique-border/60 flex items-center justify-between bg-white">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
                Atelier Hamper
              </span>
              <h2 className="text-xl font-serif font-bold text-boutique-forest">
                Your Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-9 h-9 rounded-full bg-boutique-paper hover:bg-boutique-subtle flex items-center justify-center text-boutique-charcoal transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Slot Strip */}
          <div className="bg-boutique-sageLight/60 px-6 py-3 border-b border-boutique-border/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-boutique-forest">
              <Clock className="w-4 h-4 text-boutique-sage" />
              <span>{deliverySlot.split('(')[0]} Delivery</span>
            </div>
            <span className="text-[11px] font-semibold text-boutique-sage">
              {deliveryDate}
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-boutique-blush/60 mx-auto flex items-center justify-center text-2xl">
                  🌸
                </div>
                <h3 className="font-serif font-bold text-lg text-boutique-charcoal">
                  Your Atelier Bag is Empty
                </h3>
                <p className="text-xs text-boutique-muted max-w-xs mx-auto">
                  Discover our seasonal pastries, hand-tied Dutch blooms, and curated celebration hampers.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/catalog');
                  }}
                  className="mt-4 bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider transition"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white p-4 rounded-2xl border border-boutique-border shadow-xs flex gap-3 relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-boutique-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-sm text-boutique-charcoal truncate pr-4">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-boutique-muted hover:text-boutique-roseDark transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customization Badges */}
                    <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                      {item.variantName && (
                        <span className="bg-boutique-paper px-1.5 py-0.5 rounded text-boutique-charcoal">
                          {item.variantName}
                        </span>
                      )}
                      {item.isEggless && (
                        <span className="bg-boutique-sageLight px-1.5 py-0.5 rounded text-boutique-sage font-medium">
                          Eggless
                        </span>
                      )}
                      {item.customFlavor && (
                        <span className="bg-boutique-blush px-1.5 py-0.5 rounded text-boutique-roseDark truncate max-w-[120px]">
                          {item.customFlavor}
                        </span>
                      )}
                    </div>

                    {item.customInscription && (
                      <p className="text-[10px] text-boutique-muted mt-1 italic truncate">
                        Cake text: "{item.customInscription}"
                      </p>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-boutique-border/40">
                      <div className="flex items-center border border-boutique-border rounded-full bg-boutique-paper">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-boutique-charcoal hover:bg-boutique-subtle rounded-l-full"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs px-2 font-semibold text-boutique-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-boutique-charcoal hover:bg-boutique-subtle rounded-r-full"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="font-serif font-bold text-sm text-boutique-forest">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-boutique-border/60 space-y-4">
              {/* Promo Code Input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-boutique-sageLight border border-boutique-sage/30 text-xs">
                    <div className="flex items-center gap-2 text-boutique-sage font-medium">
                      <Tag className="w-4 h-4" />
                      <span>Code <strong>{coupon.code}</strong> applied (-${discountAmount.toFixed(2)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-boutique-muted hover:text-boutique-roseDark text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo code (e.g. WELCOME10)"
                      className="flex-1 bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-boutique-paper hover:bg-boutique-subtle border border-boutique-border text-boutique-forest text-xs font-semibold px-4 py-2 rounded-xl uppercase tracking-wider transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-boutique-roseDark mt-1 font-medium">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-boutique-charcoal">
                <div className="flex justify-between">
                  <span className="text-boutique-muted">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-boutique-muted">Bespoke Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-boutique-sage">FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-boutique-sage font-medium">
                    <span>Promotional Privilege</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-boutique-border pt-2 flex justify-between text-base font-serif font-bold text-boutique-forest">
                  <span>Grand Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Bespoke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
