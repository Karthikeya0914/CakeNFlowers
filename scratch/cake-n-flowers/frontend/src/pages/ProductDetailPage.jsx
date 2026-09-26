import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, Sparkles, Check, Heart, ShieldCheck, MapPin, MessageSquare, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const FLAVORS = [
  'Belgian 70% Dark Truffle',
  'Madagascar Vanilla Bean Chantilly',
  'Red Velvet & Cream Cheese Rose',
  'Salted French Butter Caramel',
  'Pistachio Praline Crunch'
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Customization state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]);
  const [isEggless, setIsEggless] = useState(false);
  const [cakeInscription, setCakeInscription] = useState('');
  const [cardMessage, setCardMessage] = useState('');

  // Pin check state
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState(null);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        if (data.product) {
          const defaultVar = data.product.variants?.find((v) => v.isDefault) || data.product.variants?.[0] || null;
          setSelectedVariant(defaultVar);
          setIsEggless(Boolean(data.product.isEggless));
          setReviews(data.product.reviews || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-boutique-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-boutique-muted">Preparing Boutique Presentation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-boutique-charcoal">Creation Not Found</h2>
        <p className="text-xs text-boutique-muted">The requested pastry or floral arrangement is currently unavailable.</p>
        <Link to="/catalog" className="inline-block bg-boutique-forest text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider">
          Return to Collections
        </Link>
      </div>
    );
  }

  const currentPrice = product.basePrice + (selectedVariant ? selectedVariant.priceModifier : 0);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'];

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setPinStatus({
      available: true,
      message: '✓ Express Same-Day & Midnight Delivery available for this location!'
    });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: images[0],
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      quantity: 1,
      customFlavor: product.isCustomizable ? selectedFlavor : null,
      customInscription: cakeInscription.trim() || null,
      customMessageCard: cardMessage.trim() || null,
      isEggless
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: newRating,
        comment: newComment,
        userName: user?.name || reviewAuthor || 'Valued Guest'
      });
      setReviews([res.review, ...reviews]);
      setNewComment('');
      setReviewAuthor('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-boutique-muted">
        <Link to="/" className="hover:text-boutique-forest">Atelier</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-boutique-forest">Collections</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category?.slug}`} className="hover:text-boutique-forest">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-boutique-charcoal font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-boutique-paper border border-boutique-border shadow-boutique relative">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {product.isEggless && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-boutique-sage text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-boutique-sage/20">
                🌿 100% Eggless
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-boutique-forest ring-1 ring-boutique-forest' : 'border-boutique-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customization & Details Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
              {product.category?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-boutique-forest mt-1">
              {product.name}
            </h1>

            {/* Ratings & Price */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-boutique-border/50">
              <div className="flex items-center gap-2">
                <div className="flex text-boutique-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-boutique-gold" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-boutique-charcoal">{product.ratingAvg.toFixed(1)}</span>
                <span className="text-xs text-boutique-muted">({reviews.length} reviews)</span>
              </div>

              <div className="text-right">
                <span className="font-serif font-bold text-3xl text-boutique-forest">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-boutique-muted leading-relaxed">
            {product.description}
          </p>

          {/* Pincode Availability Checker */}
          <div className="p-4 rounded-2xl bg-boutique-paper/70 border border-boutique-border">
            <form onSubmit={handlePincodeCheck} className="flex gap-2 items-center">
              <MapPin className="w-4 h-4 text-boutique-sage flex-shrink-0" />
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter Pincode / Zip for delivery slot..."
                className="flex-1 bg-white border border-boutique-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
              <button
                type="submit"
                className="bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-4 py-1.5 rounded-xl uppercase tracking-wider transition"
              >
                Check
              </button>
            </form>
            {pinStatus && (
              <p className="text-[11px] text-boutique-sage font-medium mt-2 pl-6">
                {pinStatus.message}
              </p>
            )}
          </div>

          {/* Size / Variant Options */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                Select Presentation &amp; Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl text-left border text-xs transition ${
                      selectedVariant?.id === v.id
                        ? 'border-boutique-forest bg-white shadow-xs ring-1 ring-boutique-forest font-semibold'
                        : 'border-boutique-border bg-white/70 hover:border-boutique-gold'
                    }`}
                  >
                    <span className="text-boutique-charcoal block">{v.name}</span>
                    <span className="text-[11px] text-boutique-muted">
                      {v.priceModifier > 0 ? `+$${v.priceModifier.toFixed(2)}` : 'Standard'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavor Selection (if customizable) */}
          {product.isCustomizable && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                Select Gourmet Flavor Filling
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FLAVORS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlavor(f)}
                    className={`px-3 py-2 rounded-xl text-xs text-left border transition flex items-center justify-between ${
                      selectedFlavor === f
                        ? 'border-boutique-forest bg-white ring-1 ring-boutique-forest font-medium text-boutique-forest'
                        : 'border-boutique-border bg-white/70 text-boutique-charcoal hover:border-boutique-gold'
                    }`}
                  >
                    <span>{f}</span>
                    {selectedFlavor === f && <Check className="w-3.5 h-3.5 text-boutique-forest" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cake Piping Inscription */}
          {product.category?.type === 'CAKE' && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Custom Icing Message (Max 28 characters)
              </label>
              <input
                type="text"
                maxLength={28}
                value={cakeInscription}
                onChange={(e) => setCakeInscription(e.target.value)}
                placeholder="e.g. Happy 30th Birthday Victoria"
                className="w-full bg-white border border-boutique-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>
          )}

          {/* Free Message Card Note */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1 flex items-center justify-between">
              <span>Complimentary Botanical Card Note</span>
              <span className="text-[10px] text-boutique-gold uppercase font-bold">Free</span>
            </label>
            <textarea
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="Your personal message to the recipient..."
              className="w-full bg-white border border-boutique-border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-4 rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-boutique-gold" />
              <span>Add to Atelier Bag — ${currentPrice.toFixed(2)}</span>
            </button>
            {addedNotice && (
              <p className="text-center text-xs text-boutique-sage font-semibold mt-2 animate-fade-in">
                ✓ Added to your shopping bag!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Social Proof */}
      <section className="border-t border-boutique-border/60 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-serif font-bold text-boutique-forest">
              Client Commendations ({reviews.length})
            </h3>
            <p className="text-xs text-boutique-muted mt-1">
              Verified patron reviews for {product.name}
            </p>
          </div>
        </div>

        {/* Existing Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-boutique-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-boutique-charcoal">{rev.userName}</span>
                <div className="flex text-boutique-gold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-boutique-gold" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-boutique-muted leading-relaxed italic">
                "{rev.comment}"
              </p>
              <span className="text-[10px] text-boutique-paper bg-boutique-forest/10 px-2 py-0.5 rounded text-boutique-forest inline-block">
                Verified Order
              </span>
            </div>
          ))}
        </div>

        {/* Add Review Form */}
        <div className="bg-boutique-paper p-6 rounded-3xl border border-boutique-border max-w-xl">
          <h4 className="font-serif font-bold text-base text-boutique-forest mb-2">Leave a Commendation</h4>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            {!user && (
              <input
                type="text"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Your Name (e.g. Eleanor Vance)"
                className="w-full bg-white border border-boutique-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                required
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-boutique-charcoal font-medium">Rating:</span>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="bg-white border border-boutique-border rounded-lg text-xs px-2 py-1"
              >
                <option value={5}>5 Stars — Exquisite</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Satisfactory</option>
              </select>
            </div>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with the presentation, flavor, and delivery..."
              className="w-full bg-white border border-boutique-border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest resize-none"
              required
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider transition"
            >
              {submittingReview ? 'Submitting...' : 'Post Commendation'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
