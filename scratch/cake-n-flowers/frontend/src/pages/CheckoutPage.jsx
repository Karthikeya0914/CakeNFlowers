import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, CreditCard, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const SLOTS = [
  { id: 'Morning (9:00 AM - 1:00 PM)', label: 'Morning Slot', time: '9:00 AM – 1:00 PM', fee: 5 },
  { id: 'Standard (1:00 PM - 6:00 PM)', label: 'Standard Afternoon', time: '1:00 PM – 6:00 PM', fee: 5 },
  { id: 'Evening (6:00 PM - 9:00 PM)', label: 'Evening Twilight', time: '6:00 PM – 9:00 PM', fee: 8 },
  { id: 'Midnight (11:00 PM - 12:00 AM)', label: 'Midnight Surprise', time: '11:00 PM – 12:00 AM', fee: 12 }
];

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    coupon,
    deliveryDate,
    setDeliveryDate,
    deliverySlot,
    setDeliverySlot,
    clearCart
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10001');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autofill user's default address if available
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setRecipientName(defaultAddr.recipientName);
      setRecipientPhone(defaultAddr.phone);
      setStreet(defaultAddr.street);
      setLandmark(defaultAddr.landmark || '');
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setZip(defaultAddr.zip);
    }
    if (user) {
      setGuestEmail(user.email);
      setGuestName(user.name);
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-boutique-charcoal">Your Atelier Bag is Empty</h2>
        <p className="text-xs text-boutique-muted">Please add artisanal cakes or bespoke bouquets before checking out.</p>
        <Link to="/catalog" className="inline-block bg-boutique-forest text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider">
          Explore Collections
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!recipientName || !recipientPhone || !street || !city || !zip) {
      setError('Please complete all recipient and delivery address fields.');
      return;
    }

    if (!deliveryDate || !deliverySlot) {
      setError('Please select your preferred delivery date and time slot.');
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = {
        street,
        landmark,
        city,
        state,
        zip
      };

      const payload = {
        items,
        deliveryDate,
        deliverySlot,
        deliveryInstructions: instructions,
        recipientName,
        recipientPhone,
        shippingAddress,
        guestEmail,
        guestName,
        guestPhone,
        couponCode: coupon?.code,
        paymentMethod
      };

      const res = await api.post('/orders', payload);

      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmed?orderNumber=${res.orderNumber}`);
    } catch (err) {
      setError(err.message || 'Failed to process order.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-boutique-border/60 pb-6 mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
          Secure White-Glove Checkout
        </span>
        <h1 className="text-3xl font-serif font-bold text-boutique-forest mt-1">
          Complete Your Bespoke Order
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-boutique-blush border border-boutique-rose/30 flex items-center gap-3 text-xs text-boutique-roseDark font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form Area */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact */}
          <div className="bg-white p-6 rounded-3xl border border-boutique-border space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-boutique-forest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-boutique-paper text-xs flex items-center justify-center font-sans">1</span>
              <span>Purchaser &amp; Notification Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Olivia Sterling"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Notification Email (for tracking updates)
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="olivia@example.com"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Date & Slot */}
          <div className="bg-white p-6 rounded-3xl border border-boutique-border space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-boutique-forest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-boutique-paper text-xs flex items-center justify-center font-sans">2</span>
              <span>Schedule Delivery Date &amp; Slot</span>
            </h2>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full sm:w-64 bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                Select Time Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SLOTS.map((slot) => {
                  const isSelected = deliverySlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setDeliverySlot(slot.id)}
                      className={`p-3.5 rounded-2xl text-left border text-xs transition ${
                        isSelected
                          ? 'border-boutique-forest bg-boutique-sageLight/50 ring-1 ring-boutique-forest font-semibold'
                          : 'border-boutique-border hover:border-boutique-gold bg-boutique-cream/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-boutique-charcoal">{slot.label}</span>
                        <span className="text-[11px] text-boutique-muted">{slot.fee === 0 ? 'Included' : `+$${slot.fee}`}</span>
                      </div>
                      <span className="text-[11px] text-boutique-muted block mt-0.5">{slot.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Recipient & Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-boutique-border space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-boutique-forest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-boutique-paper text-xs flex items-center justify-center font-sans">3</span>
              <span>Recipient &amp; Delivery Destination</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Claire Beauchamp"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Recipient Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+1 (555) 345-6789"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Street Address / Apartment / Suite
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="450 Lexington Ave, Suite 1200"
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="NY"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10017"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Leave with doorman or ring buzzer 4B twice."
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>
          </div>

          {/* Section 4: Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-boutique-border space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-boutique-forest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-boutique-paper text-xs flex items-center justify-center font-sans">4</span>
              <span>Payment Confirmation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                paymentMethod === 'STRIPE' ? 'border-boutique-forest bg-boutique-sageLight/40 ring-1 ring-boutique-forest' : 'border-boutique-border'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="STRIPE"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                  className="accent-boutique-forest"
                />
                <div>
                  <span className="text-xs font-bold text-boutique-charcoal block">Credit / Debit Card (Stripe)</span>
                  <span className="text-[10px] text-boutique-muted">Instant card authorization with 256-bit encryption</span>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                paymentMethod === 'COD' ? 'border-boutique-forest bg-boutique-sageLight/40 ring-1 ring-boutique-forest' : 'border-boutique-border'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-boutique-forest"
                />
                <div>
                  <span className="text-xs font-bold text-boutique-charcoal block">Pay on Delivery</span>
                  <span className="text-[10px] text-boutique-muted">Cash or card upon courier arrival</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-boutique space-y-5 sticky top-28">
            <h3 className="font-serif font-bold text-xl text-boutique-forest border-b border-boutique-border/60 pb-3">
              Atelier Order Summary
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.cartId} className="flex gap-3 text-xs">
                  <img src={it.image} alt={it.name} className="w-12 h-12 rounded-xl object-cover border border-boutique-border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between font-medium text-boutique-charcoal">
                      <span className="truncate pr-2">{it.name}</span>
                      <span>${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-boutique-muted block">
                      Qty: {it.quantity} {it.variantName ? `• ${it.variantName}` : ''}
                    </span>
                    {it.customInscription && (
                      <span className="text-[10px] text-boutique-muted italic block truncate">
                        "{it.customInscription}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-boutique-border/60 pt-4 space-y-2 text-xs text-boutique-charcoal">
              <div className="flex justify-between">
                <span className="text-boutique-muted">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-boutique-muted">Bespoke Delivery ({deliverySlot.split('(')[0].trim()})</span>
                <span>{deliveryFee === 0 ? <strong className="text-boutique-sage">FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-boutique-sage font-medium">
                  <span>Privilege Code ({coupon?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-boutique-border pt-3 flex justify-between text-lg font-serif font-bold text-boutique-forest">
                <span>Grand Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-4 rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-boutique-gold" />
                  <span>Place Order — ${total.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-boutique-muted pt-2">
              <ShieldCheck className="w-4 h-4 text-boutique-sage" />
              <span>Chilled freshness &amp; timely delivery guaranteed</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
