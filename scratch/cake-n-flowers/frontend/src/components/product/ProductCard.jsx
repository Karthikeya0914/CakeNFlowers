import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles, Heart } from 'lucide-react';

export default function ProductCard({ product, onCustomize }) {
  const primaryImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

  const secondaryImage = Array.isArray(product.images) && product.images.length > 1
    ? product.images[1]
    : primaryImage;

  return (
    <div className="group relative bg-white rounded-2xl border border-boutique-border/70 overflow-hidden shadow-boutique hover:shadow-boutique-hover transition-all duration-500 flex flex-col">
      {/* Image Container with Hover Reveal */}
      <div className="relative aspect-square w-full overflow-hidden bg-boutique-paper">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isEggless && (
            <span className="bg-white/90 backdrop-blur-sm text-boutique-sage text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-boutique-sage/20">
              🌿 100% Eggless
            </span>
          )}
          {product.isCustomizable && (
            <span className="bg-boutique-forest/90 backdrop-blur-sm text-boutique-gold text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              ✨ Customizable
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-boutique-muted hover:text-boutique-rose transition shadow-sm"
          aria-label="Save to favorites"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-boutique-muted mb-1.5">
            <span className="uppercase tracking-widest font-semibold text-[10px] text-boutique-gold">
              {product.category?.name || 'Boutique'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-boutique-gold text-boutique-gold" />
              <span className="font-semibold text-boutique-charcoal text-xs">{product.ratingAvg.toFixed(1)}</span>
              <span className="text-[11px] text-boutique-muted">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif font-bold text-base text-boutique-charcoal group-hover:text-boutique-roseDark transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-boutique-muted mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-boutique-border/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-boutique-muted block leading-none">Starting from</span>
            <span className="font-serif font-bold text-lg text-boutique-forest">
              ${product.basePrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onCustomize(product)}
            className="bg-boutique-forest hover:bg-boutique-sage text-boutique-paper px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition shadow-sm"
          >
            {product.isCustomizable ? 'Customize' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
