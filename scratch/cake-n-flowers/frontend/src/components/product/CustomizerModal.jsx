import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Heart, Upload, MessageSquare, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FLAVOR_OPTIONS = [
  'Belgian 70% Dark Truffle',
  'Madagascar Vanilla Bean Chantilly',
  'Red Velvet & Cream Cheese Rose',
  'Salted French Butter Caramel',
  'Pistachio Praline Crunch'
];

export default function CustomizerModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVOR_OPTIONS[0]);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeInscription, setCakeInscription] = useState('');
  const [messageCard, setMessageCard] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultVar = product.variants?.find((v) => v.isDefault) || product.variants?.[0] || null;
      setSelectedVariant(defaultVar);
      setIsEggless(Boolean(product.isEggless));
      setCakeInscription('');
      setMessageCard('');
      setPhotoUrl('');
      setAddedAnimation(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentPrice = product.basePrice + (selectedVariant ? selectedVariant.priceModifier : 0);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setPhotoUrl(data.url);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddToCart = () => {
    const primaryImg = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

    addToCart({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: primaryImg,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      quantity: 1,
      customFlavor: product.isCustomizable ? selectedFlavor : null,
      customInscription: cakeInscription.trim() || null,
      customMessageCard: messageCard.trim() || null,
      customPhotoUrl: photoUrl || null,
      isEggless
    });

    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-boutique-forest/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-boutique-cream rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-boutique-border p-6 sm:p-8 animate-fade-in z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-boutique-border flex items-center justify-center text-boutique-charcoal hover:bg-boutique-paper transition"
          aria-label="Close customizer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Product Summary */}
        <div className="flex gap-4 sm:gap-6 border-b border-boutique-border/60 pb-6 items-center">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80'}
            alt={product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-boutique-border shadow-sm flex-shrink-0"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
              {product.category?.name || 'Bespoke Atelier'}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-boutique-charcoal">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-serif font-bold text-xl text-boutique-forest">
                ${currentPrice.toFixed(2)}
              </span>
              {selectedVariant && selectedVariant.priceModifier > 0 && (
                <span className="text-xs text-boutique-muted">
                  (+${selectedVariant.priceModifier.toFixed(2)} for {selectedVariant.name})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="py-6 space-y-6">
          {/* 1. Size / Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                1. Select Size &amp; Portion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl text-left border text-xs transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-boutique-forest bg-white shadow-sm ring-1 ring-boutique-forest font-semibold'
                          : 'border-boutique-border/80 bg-white/70 hover:border-boutique-gold'
                      }`}
                    >
                      <span className="text-boutique-charcoal">{variant.name}</span>
                      <span className="text-[11px] text-boutique-muted mt-1">
                        {variant.priceModifier > 0 ? `+$${variant.priceModifier.toFixed(2)}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Flavor Selector (if customizable) */}
          {product.isCustomizable && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                2. Artisan Flavor Filling
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FLAVOR_OPTIONS.map((flv) => (
                  <button
                    key={flv}
                    type="button"
                    onClick={() => setSelectedFlavor(flv)}
                    className={`px-3 py-2 rounded-xl text-xs text-left border transition flex items-center justify-between ${
                      selectedFlavor === flv
                        ? 'border-boutique-forest bg-white ring-1 ring-boutique-forest font-medium text-boutique-forest'
                        : 'border-boutique-border bg-white/60 text-boutique-charcoal hover:border-boutique-gold'
                    }`}
                  >
                    <span>{flv}</span>
                    {selectedFlavor === flv && <Check className="w-3.5 h-3.5 text-boutique-forest" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Eggless / Dietary Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-boutique-border">
            <div className="flex items-center gap-3">
              <span className="text-lg">🌿</span>
              <div>
                <span className="text-xs font-semibold text-boutique-charcoal block">100% Eggless Preparation</span>
                <span className="text-[11px] text-boutique-muted">Bespoke moist eggless sponge baked in dedicated ovens.</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEggless}
                onChange={(e) => setIsEggless(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-boutique-forest"></div>
            </label>
          </div>

          {/* 4. Cake Inscription */}
          {product.category?.type === 'CAKE' && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                3. Piping Text on Cake (Optional, Max 28 Chars)
              </label>
              <input
                type="text"
                maxLength={28}
                value={cakeInscription}
                onChange={(e) => setCakeInscription(e.target.value)}
                placeholder="e.g. Happy 25th Birthday Sarah! ❤️"
                className="w-full bg-white border border-boutique-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>
          )}

          {/* 5. Custom Photo Cake Upload */}
          {product.hasPhotoUpload && (
            <div className="p-4 rounded-2xl bg-white border border-dashed border-boutique-border">
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Upload Photo for Edible Print
              </label>
              <p className="text-[11px] text-boutique-muted mb-2">High resolution JPG or PNG for crisp sugar sheet printing.</p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-boutique-paper hover:bg-boutique-subtle text-boutique-forest px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-boutique-border transition">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Choose Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
                {photoUrl && (
                  <div className="flex items-center gap-2 text-xs text-boutique-sage font-medium">
                    <Check className="w-4 h-4" />
                    <span>Photo attached</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Complimentary Luxury Card Message */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1 flex items-center justify-between">
              <span>Complimentary Handwritten Message Card</span>
              <span className="text-[10px] text-boutique-gold uppercase font-bold tracking-widest">Free with every order</span>
            </label>
            <textarea
              rows={3}
              value={messageCard}
              onChange={(e) => setMessageCard(e.target.value)}
              placeholder="Write your heartfelt note here... We hand-pen every card on botanical heavy-stock paper."
              className="w-full bg-white border border-boutique-border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-boutique-border/60 pt-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-boutique-muted block">Total Investment</span>
            <span className="font-serif font-bold text-2xl text-boutique-forest">
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-md ${
              addedAnimation
                ? 'bg-boutique-sage text-white'
                : 'bg-boutique-forest hover:bg-boutique-sage text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" /> Added to Atelier Bag
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-boutique-gold" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
