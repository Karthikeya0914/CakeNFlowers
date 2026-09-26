import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, Sparkles, ArrowRight, Truck, Heart } from 'lucide-react';

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'CNF-2026-DEMO';

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C49E58', '#4A6B53', '#F7EBE8', '#C97D76', '#1F3025']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8 animate-fade-in">
      {/* Icon & Celebration */}
      <div className="w-20 h-20 rounded-full bg-boutique-sageLight mx-auto flex items-center justify-center text-boutique-sage shadow-sm border border-boutique-sage/30">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-boutique-forest">
          Merci Pour Votre Commande
        </h1>
        <p className="text-xs sm:text-sm text-boutique-muted max-w-md mx-auto">
          Your order has been received at our atelier. Our pastry chefs and master florists are preparing your bespoke creations.
        </p>
      </div>

      {/* Order Badge Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boutique-border shadow-boutique max-w-md mx-auto space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-boutique-border/60 pb-3">
          <span className="text-xs text-boutique-muted">Order Reference</span>
          <span className="font-mono font-bold text-sm text-boutique-forest">{orderNumber}</span>
        </div>

        <div className="space-y-2 text-xs text-boutique-charcoal">
          <div className="flex items-center gap-2 text-boutique-sage">
            <Truck className="w-4 h-4" />
            <span className="font-medium">Temperature-Controlled White Glove Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-boutique-forest">
            <Clock className="w-4 h-4" />
            <span>Scheduled delivery slot confirmed</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}`}
            className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Track Order in Real-Time</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div>
        <Link
          to="/catalog"
          className="text-xs font-semibold uppercase tracking-wider text-boutique-forest hover:text-boutique-rose underline decoration-dotted transition"
        >
          Return to Atelier Collections
        </Link>
      </div>
    </div>
  );
}
