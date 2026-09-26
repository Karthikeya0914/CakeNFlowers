import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, Sparkles, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-boutique-forest text-boutique-paper pt-16 pb-12 border-t border-boutique-forest/90">
      {/* Brand Ethos Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-boutique-sage/40 flex items-center justify-center text-boutique-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-base">Couture Chilled Delivery</h4>
              <p className="text-xs text-boutique-paper/70">Temperature-controlled vans ensure fresh flowers & pristine icing.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-boutique-sage/40 flex items-center justify-center text-boutique-gold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-base">Master Chef & Florist Handcrafted</h4>
              <p className="text-xs text-boutique-paper/70">Made fresh to order with Callebaut chocolate & farm-cut blossoms.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-boutique-sage/40 flex items-center justify-center text-boutique-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-base">Guaranteed Delivery Slot</h4>
              <p className="text-xs text-boutique-paper/70">Morning, evening, or midnight surprise on your exact date.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              Cake <span className="italic font-ornate text-boutique-rose">&amp;</span> Flowers
            </h3>
            <p className="text-xs text-boutique-paper/80 leading-relaxed max-w-sm">
              An atelier dedicated to the art of bespoke celebration. We unite Parisian pâtisserie traditions with contemporary floral architecture to create poignant sensory gifts.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-widest text-boutique-gold font-medium block">
                Boutique Hours: 8:00 AM – 10:00 PM Daily
              </span>
              <span className="text-[11px] text-boutique-paper/60">Midnight delivery operates 11:00 PM – 12:00 AM</span>
            </div>
          </div>

          {/* Curations */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-boutique-gold font-semibold">Collections</h4>
            <ul className="space-y-2 text-xs text-boutique-paper/80">
              <li><Link to="/catalog?category=cakes" className="hover:text-white transition">Artisanal Cakes</Link></li>
              <li><Link to="/catalog?category=flowers" className="hover:text-white transition">Bespoke Florals</Link></li>
              <li><Link to="/catalog?category=combos" className="hover:text-white transition">Couture Combos</Link></li>
              <li><Link to="/catalog?category=gifts" className="hover:text-white transition">Macarons &amp; Gifts</Link></li>
              <li><Link to="/catalog?isEggless=true" className="hover:text-white transition">Eggless Delicacies</Link></li>
            </ul>
          </div>

          {/* Occasions */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-boutique-gold font-semibold">Occasions</h4>
            <ul className="space-y-2 text-xs text-boutique-paper/80">
              <li><Link to="/catalog?occasion=birthday" className="hover:text-white transition">Birthday Jubilees</Link></li>
              <li><Link to="/catalog?occasion=anniversary" className="hover:text-white transition">Anniversary Milestones</Link></li>
              <li><Link to="/catalog?occasion=romance" className="hover:text-white transition">Love &amp; Romance</Link></li>
              <li><Link to="/catalog?occasion=congratulations" className="hover:text-white transition">Congratulations</Link></li>
              <li><Link to="/catalog?occasion=luxury" className="hover:text-white transition">VIP Luxury Selection</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-boutique-gold font-semibold">The Atelier Society</h4>
            <p className="text-xs text-boutique-paper/70">
              Receive seasonal floral lookbooks and invitation-only tasting releases.
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 text-white text-xs px-3 py-2.5 rounded-l-md border border-white/20 focus:outline-none focus:border-boutique-gold flex-1 placeholder:text-white/40"
              />
              <button
                type="button"
                className="bg-boutique-gold text-boutique-forest px-3 py-2.5 rounded-r-md hover:bg-white transition"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-boutique-paper/60 gap-4">
        <div>
          &copy; {new Date().getFullYear()} Cake N Flowers Atelier. All rights reserved. Handcrafted with care.
        </div>
        <div className="flex space-x-6">
          <Link to="/track-order" className="hover:text-white transition">Track Your Order</Link>
          <span className="hover:text-white cursor-pointer transition">Delivery &amp; Care Guide</span>
          <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition">Terms of Atelier</span>
        </div>
      </div>
    </footer>
  );
}
