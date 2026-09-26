import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import CustomizerModal from '../components/product/CustomizerModal';

const CATEGORIES = [
  { slug: '', label: 'All Collections' },
  { slug: 'cakes', label: 'Artisanal Cakes' },
  { slug: 'flowers', label: 'Bespoke Florals' },
  { slug: 'combos', label: 'Luxury Combos' },
  { slug: 'gifts', label: 'Macarons & Gifts' }
];

const OCCASIONS = [
  { id: '', label: 'All Occasions' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'romance', label: 'Love & Romance' },
  { id: 'luxury', label: 'VIP Luxury' },
  { id: 'congratulations', label: 'Congratulations' }
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Filters from URL or state
  const currentCategory = searchParams.get('category') || '';
  const currentOccasion = searchParams.get('occasion') || '';
  const searchQuery = searchParams.get('search') || '';
  const isEgglessParam = searchParams.get('isEggless') === 'true';
  const sortParam = searchParams.get('sort') || 'popular';

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (currentCategory) query.set('category', currentCategory);
    if (currentOccasion) query.set('occasion', currentOccasion);
    if (searchQuery) query.set('search', searchQuery);
    if (isEgglessParam) query.set('isEggless', 'true');
    if (sortParam) query.set('sort', sortParam);

    api.get(`/products?${query.toString()}`)
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentCategory, currentOccasion, searchQuery, isEgglessParam, sortParam]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleCustomize = (product) => {
    setSelectedProduct(product);
    setIsCustomizerOpen(true);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-boutique-border/60 pb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
          Curated Atelier Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-boutique-forest mt-1">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : currentCategory
            ? CATEGORIES.find((c) => c.slug === currentCategory)?.label || 'The Collection'
            : 'All Bespoke Creations'}
        </h1>
        <p className="text-xs sm:text-sm text-boutique-muted mt-2 max-w-2xl">
          Browse our couture pastry repertoire, freshly composed floral silhouettes, and celebratory hampers.
        </p>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-boutique-border shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = currentCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => updateFilter('category', cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  active
                    ? 'bg-boutique-forest text-white font-semibold shadow-xs'
                    : 'bg-boutique-paper text-boutique-charcoal hover:bg-boutique-subtle'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Dietary Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Eggless Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-boutique-cream px-3 py-1.5 rounded-full border border-boutique-border text-xs">
            <input
              type="checkbox"
              checked={isEgglessParam}
              onChange={(e) => updateFilter('isEggless', e.target.checked ? 'true' : '')}
              className="accent-boutique-forest"
            />
            <span className="font-semibold text-boutique-charcoal">🌿 100% Eggless</span>
          </label>

          {/* Occasion Dropdown */}
          <select
            value={currentOccasion}
            onChange={(e) => updateFilter('occasion', e.target.value)}
            className="bg-boutique-cream border border-boutique-border text-xs rounded-full px-3 py-2 text-boutique-charcoal focus:outline-none focus:ring-1 focus:ring-boutique-forest"
          >
            {OCCASIONS.map((occ) => (
              <option key={occ.id} value={occ.id}>
                {occ.label}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortParam}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-boutique-cream border border-boutique-border text-xs rounded-full px-3 py-2 text-boutique-charcoal focus:outline-none focus:ring-1 focus:ring-boutique-forest"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Clear Filters */}
          {(currentCategory || currentOccasion || searchQuery || isEgglessParam) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-boutique-roseDark hover:underline flex items-center gap-1 font-medium pl-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-96 animate-pulse border border-boutique-border" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-boutique-border space-y-4">
          <div className="w-16 h-16 rounded-full bg-boutique-blush/60 mx-auto flex items-center justify-center text-3xl">
            ✨
          </div>
          <h3 className="font-serif font-bold text-xl text-boutique-charcoal">
            No creations match your selected preferences.
          </h3>
          <p className="text-xs text-boutique-muted max-w-md mx-auto">
            Try resetting your dietary tags, occasion filters, or search terms to view our complete collection.
          </p>
          <button
            onClick={clearAllFilters}
            className="bg-boutique-forest text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider hover:bg-boutique-sage transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onCustomize={handleCustomize}
            />
          ))}
        </div>
      )}

      {/* Customizer Modal */}
      <CustomizerModal
        product={selectedProduct}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}
