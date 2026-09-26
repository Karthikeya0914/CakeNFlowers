import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, CheckCircle, Package, Truck, Gift, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = (num) => {
    if (!num) return;
    setLoading(true);
    setError('');
    api.get(`/orders/track/${encodeURIComponent(num.trim())}`)
      .then((data) => {
        setOrderData(data.order);
      })
      .catch((err) => {
        setError(err.message || 'Unable to locate order with this reference.');
        setOrderData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ orderNumber: orderNumberInput.trim() });
      fetchOrder(orderNumberInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
          Real-Time Courier Dispatch
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-boutique-forest">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-boutique-muted max-w-md mx-auto">
          Follow your bespoke pastry and floral arrangement every step of the journey from our atelier ovens to the recipient's doorstep.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-boutique-border shadow-xs max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-boutique-muted absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="e.g. CNF-2026-8941"
              className="w-full bg-boutique-cream border border-boutique-border rounded-xl pl-10 pr-3 py-2 text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-boutique-forest"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-6 py-2 rounded-xl uppercase tracking-wider transition"
          >
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <span className="text-[11px] text-boutique-muted">
            Tip: Try demo order <button type="button" onClick={() => { setOrderNumberInput('CNF-2026-8941'); fetchOrder('CNF-2026-8941'); }} className="underline font-mono text-boutique-forest font-semibold">CNF-2026-8941</button>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-boutique-blush border border-boutique-rose/30 flex items-center justify-center gap-2 text-xs text-boutique-roseDark font-medium max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Timeline Card */}
      {orderData && (
        <div className="bg-white rounded-3xl border border-boutique-border shadow-boutique p-6 sm:p-10 space-y-8 animate-fade-in">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-boutique-border/60 pb-6 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
                Atelier Consignment
              </span>
              <h2 className="text-2xl font-serif font-bold text-boutique-forest">
                Order {orderData.orderNumber}
              </h2>
              <p className="text-xs text-boutique-muted mt-0.5">
                Scheduled for <strong className="text-boutique-charcoal">{orderData.deliveryDate}</strong> during{' '}
                <strong className="text-boutique-charcoal">{orderData.deliverySlot}</strong>
              </p>
            </div>

            <button
              onClick={() => fetchOrder(orderData.orderNumber)}
              className="inline-flex items-center gap-1.5 text-xs text-boutique-sage hover:text-boutique-forest font-semibold border border-boutique-sage/30 px-3 py-1.5 rounded-full self-start sm:self-auto bg-boutique-sageLight/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* 5-Step Visual Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {orderData.stages.map((stage, idx) => {
                const isPassed = idx < orderData.currentStageIndex;
                const isCurrent = idx === orderData.currentStageIndex;

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-boutique-forest bg-boutique-sageLight/60 ring-2 ring-boutique-forest/40 shadow-xs'
                        : isPassed
                        ? 'border-boutique-sage/40 bg-boutique-paper'
                        : 'border-boutique-border/50 bg-boutique-cream/30 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                          isPassed || isCurrent
                            ? 'bg-boutique-forest text-white'
                            : 'bg-boutique-border text-boutique-muted'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </span>
                        {isCurrent && (
                          <span className="bg-boutique-gold text-boutique-forest text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-boutique-charcoal">
                        {stage.label}
                      </h4>
                      <p className="text-[11px] text-boutique-muted mt-1 leading-tight">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-boutique-border/60">
            {/* Courier info */}
            <div className="bg-boutique-paper/60 p-5 rounded-2xl border border-boutique-border space-y-2">
              <div className="flex items-center gap-2 text-boutique-forest font-semibold text-xs uppercase tracking-wider">
                <Truck className="w-4 h-4 text-boutique-sage" />
                <span>Courier Transport</span>
              </div>
              <p className="text-xs text-boutique-charcoal font-medium">
                {orderData.courierName || 'Artisan Chilled Courier Fleet'}
              </p>
              {orderData.trackingNumber && (
                <p className="text-[11px] text-boutique-muted font-mono">
                  Waybill Ref: {orderData.trackingNumber}
                </p>
              )}
              <span className="inline-block text-[10px] bg-boutique-sageLight text-boutique-sage px-2 py-0.5 rounded font-semibold">
                Van Climate Controlled at 4°C
              </span>
            </div>

            {/* Recipient info */}
            <div className="bg-boutique-paper/60 p-5 rounded-2xl border border-boutique-border space-y-2">
              <div className="flex items-center gap-2 text-boutique-forest font-semibold text-xs uppercase tracking-wider">
                <Gift className="w-4 h-4 text-boutique-rose" />
                <span>Recipient Details</span>
              </div>
              <p className="text-xs font-bold text-boutique-charcoal">
                {orderData.recipientName} ({orderData.recipientPhone})
              </p>
              <p className="text-xs text-boutique-muted">
                {typeof orderData.shippingAddress === 'object'
                  ? `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city} ${orderData.shippingAddress.zip}`
                  : orderData.shippingAddress}
              </p>
              {orderData.deliveryInstructions && (
                <p className="text-[11px] text-boutique-muted italic">
                  Note: "{orderData.deliveryInstructions}"
                </p>
              )}
            </div>
          </div>

          {/* Items In Consignment */}
          <div className="border-t border-boutique-border/60 pt-6 space-y-4">
            <h4 className="font-serif font-bold text-base text-boutique-forest">
              Items in This Handcraft Consignment
            </h4>
            <div className="space-y-3">
              {orderData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-boutique-border bg-boutique-cream/40"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-boutique-border"
                    />
                    <div>
                      <h5 className="font-serif font-bold text-xs text-boutique-charcoal">
                        {item.product?.name}
                      </h5>
                      <span className="text-[11px] text-boutique-muted">
                        Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''} {item.customFlavor ? `• ${item.customFlavor}` : ''}
                      </span>
                      {item.customInscription && (
                        <p className="text-[10px] text-boutique-muted italic">
                          Piped message: "{item.customInscription}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-boutique-forest">
                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
