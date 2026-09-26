import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, Clock, ShieldCheck, Heart, Truck, Gift } from 'lucide-react';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import CustomizerModal from '../components/product/CustomizerModal';

const OCCASIONS = [
  { id: 'birthday', label: 'Birthday Jubilees', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80', description: 'Celebratory tiers and vibrant blooms' },
  { id: 'anniversary', label: 'Anniversary Milestones', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80', description: 'Crimson Ecuadorian roses & rich truffles' },
  { id: 'romance', label: 'Love & Romance', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', description: 'Intimate gestures and bespoke pairings' },
  { id: 'luxury', label: 'VIP Grand Combos', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', description: 'Orchestrated floral hampers & champagne cakes' }
];

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products/featured')
      .then((data) => setBestsellers(data.bestsellers || []))
      .catch((err) => console.error(err));

    api.get('/categories')
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  const handleCustomize = (product) => {
    setSelectedProduct(product);
    setIsCustomizerOpen(true);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-boutique-cream overflow-hidden">
        {/* Background Ambient Shapes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-boutique-blush/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-boutique-sageLight/50 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-boutique-border shadow-xs text-boutique-forest text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-boutique-gold" />
                <span>Bespoke Pâtisserie &amp; Floral Atelier</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-boutique-forest tracking-tight leading-[1.08]">
                Where Couture <br className="hidden sm:inline" />
                <span className="font-ornate italic font-normal text-boutique-rose">Flavors</span> Meet <br />
                Bespoke Blooms.
              </h1>

              <p className="text-sm sm:text-base text-boutique-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in handcrafted Callebaut chocolate creations and farm-fresh Dutch floral compositions. Delivered with meticulous chilled care, including same-day and midnight surprise slots.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/catalog?category=cakes"
                  className="w-full sm:w-auto bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-8 py-4 rounded-full uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Explore Artisanal Cakes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog?category=flowers"
                  className="w-full sm:w-auto bg-white hover:bg-boutique-paper border border-boutique-border text-boutique-forest text-xs font-semibold px-8 py-4 rounded-full uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Bespoke Florals</span>
                </Link>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-boutique-border/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="font-serif font-bold text-lg text-boutique-forest block">4.9 ★</span>
                  <span className="text-[11px] text-boutique-muted">Over 1,200 Verified Reviews</span>
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-boutique-forest block">100%</span>
                  <span className="text-[11px] text-boutique-muted">Chilled Courier Freshness</span>
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-boutique-forest block">11 PM</span>
                  <span className="text-[11px] text-boutique-muted">Midnight Surprise Slots</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image */}
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-boutique-paper">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85"
                    alt="Royal Rose and Cake Celebration Combo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Micro Card: Midnight Delivery */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-boutique-border shadow-xl flex items-center gap-3 animate-fade-in max-w-xs">
                  <div className="w-10 h-10 rounded-xl bg-boutique-sageLight flex items-center justify-center text-boutique-sage flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-boutique-gold block">
                      Guaranteed Precision
                    </span>
                    <span className="text-xs font-semibold text-boutique-charcoal">
                      Midnight Surprise Delivery
                    </span>
                  </div>
                </div>

                {/* Floating Micro Card: Top Rated */}
                <div className="absolute -top-6 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-boutique-border shadow-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-boutique-blush flex items-center justify-center text-boutique-roseDark">
                    <Star className="w-4 h-4 fill-boutique-roseDark" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-boutique-charcoal block">Boutique Choice</span>
                    <span className="text-[10px] text-boutique-muted">Belgian Dark Truffle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions "Curated for the Moment" Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
            Celebrate Every Sentiment
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boutique-forest mt-1">
            Curated for the Moment
          </h2>
          <p className="text-xs sm:text-sm text-boutique-muted mt-2">
            Each occasion calls for a specific mood. Explore handcrafted floral silhouettes and confection profiles tailored to life's sweetest milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.id}
              to={`/catalog?occasion=${occ.id}`}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-boutique hover:shadow-boutique-hover transition-all duration-500 flex flex-col justify-end p-6 border border-boutique-border"
            >
              <img
                src={occ.image}
                alt={occ.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-boutique-forest/90 via-boutique-forest/30 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-boutique-gold">
                  Explore Collection
                </span>
                <h3 className="font-serif font-bold text-xl leading-snug">{occ.label}</h3>
                <p className="text-xs text-white/80 line-clamp-1">{occ.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
              Patron Favorites
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boutique-forest mt-1">
              Atelier Bestsellers
            </h2>
            <p className="text-xs sm:text-sm text-boutique-muted mt-1">
              Our most-requested confections, grand floral arrangements, and celebration hampers.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold uppercase tracking-wider text-boutique-forest hover:text-boutique-rose flex items-center gap-1.5 transition"
          >
            <span>View Complete Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCustomize={handleCustomize}
            />
          ))}
        </div>
      </section>

      {/* The Atelier Difference / Why Cake N Flowers */}
      <section className="bg-boutique-paper py-20 border-y border-boutique-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
              The Atelier Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boutique-forest mt-1">
              Why Discerning Patrons Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-boutique-blush mx-auto flex items-center justify-center text-xl">
                🍫
              </div>
              <h3 className="font-serif font-bold text-base text-boutique-charcoal">Single-Origin Cocoa</h3>
              <p className="text-xs text-boutique-muted leading-relaxed">
                We exclusively bake with Callebaut Belgian 70% dark chocolate and real Madagascar bourbon vanilla beans.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-boutique-sageLight mx-auto flex items-center justify-center text-xl">
                🌹
              </div>
              <h3 className="font-serif font-bold text-base text-boutique-charcoal">Direct-From-Farm Stems</h3>
              <p className="text-xs text-boutique-muted leading-relaxed">
                Ecuadorian roses and Dutch hydrangeas harvested at peak bloom for maximum vase longevity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-boutique-goldLight mx-auto flex items-center justify-center text-xl">
                ✍️
              </div>
              <h3 className="font-serif font-bold text-base text-boutique-charcoal">Handwritten Card Notes</h3>
              <p className="text-xs text-boutique-muted leading-relaxed">
                Every order includes a heavy-stock botanical keepsake card hand-penned by our calligraphy artisans.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-boutique-paper mx-auto flex items-center justify-center text-xl">
                🚚
              </div>
              <h3 className="font-serif font-bold text-base text-boutique-charcoal">Chilled White-Glove Transit</h3>
              <p className="text-xs text-boutique-muted leading-relaxed">
                Climate-controlled delivery vans guarantee zero melting, pristine piping, and crisp floral foliage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Same-Day & Midnight Delivery Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-boutique-forest text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
              Urgent Celebrations Handled With Grace
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-snug">
              Need Same-Day or Midnight Delivery?
            </h2>
            <p className="text-xs sm:text-sm text-boutique-paper/80 leading-relaxed">
              Place your order before 5:00 PM for same-day evening delivery, or schedule our signature 11:00 PM – 12:00 AM Midnight Surprise slot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto">
            <Link
              to="/catalog"
              className="bg-boutique-gold hover:bg-white text-boutique-forest text-xs font-semibold px-7 py-3.5 rounded-full uppercase tracking-wider transition text-center shadow-sm"
            >
              Order for Today
            </Link>
            <Link
              to="/track-order"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-7 py-3.5 rounded-full uppercase tracking-wider transition text-center"
            >
              Track Active Order
            </Link>
          </div>
        </div>
      </section>

      {/* Customizer Modal */}
      <CustomizerModal
        product={selectedProduct}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}
