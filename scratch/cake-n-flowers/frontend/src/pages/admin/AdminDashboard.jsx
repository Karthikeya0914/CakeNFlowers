import React, { useState, useEffect } from 'react';
import { ShieldCheck, Package, DollarSign, Clock, AlertTriangle, Plus, RefreshCw, CheckCircle2, ChevronRight, Tag, Upload, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = [
  'CONFIRMED',
  'PREPARING',
  'QUALITY_PASSED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

export default function AdminDashboard({ onOpenAuthModal }) {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, products, coupons
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdEggless, setNewProdEggless] = useState(false);
  const [newProdCustomizable, setNewProdCustomizable] = useState(true);
  const [newProdImages, setNewProdImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const res = await api.post('/uploads/multiple', formData);
      if (res.urls && res.urls.length > 0) {
        setNewProdImages((prev) => [...prev, ...res.urls]);
      }
    } catch (err) {
      alert(err.message || 'Error uploading photos');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setNewProdImages((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setNewProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setNewProdImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // New Coupon Form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('PERCENTAGE');
  const [newCouponVal, setNewCouponVal] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/orders'),
      api.get('/products?limit=100'),
      api.get('/categories')
    ])
      .then(([dashData, ordersData, prodsData, catsData]) => {
        setStats(dashData.stats);
        setOrders(ordersData.orders || []);
        setProducts(prodsData.products || []);
        setCategories(catsData.categories || []);
        if (catsData.categories?.length > 0 && !newProdCat) {
          setNewProdCat(catsData.categories[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-boutique-blush mx-auto flex items-center justify-center text-boutique-roseDark">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-boutique-forest">Atelier Management Portal</h2>
        <p className="text-xs text-boutique-muted">
          Administrative credentials required. Please sign in with an administrator account to access dispatch and inventory controls.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-8 py-3 rounded-full uppercase tracking-wider transition"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreatingProduct(true);
    try {
      const finalImages = newProdImages.length > 0
        ? newProdImages
        : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'];

      await api.post('/admin/products', {
        name: newProdName,
        categoryId: newProdCat,
        basePrice: parseFloat(newProdPrice),
        description: newProdDesc,
        images: finalImages,
        isEggless: newProdEggless,
        isCustomizable: newProdCustomizable,
        stock: 50
      });
      alert('Product created with gallery photos successfully!');
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
      setNewProdImages([]);
      setUrlInput('');
      loadData();
    } catch (err) {
      alert(err.message || 'Error creating product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCreatingCoupon(true);
    try {
      await api.post('/admin/coupons', {
        code: newCouponCode,
        discountType: newCouponType,
        discountValue: parseFloat(newCouponVal),
        minOrderAmount: parseFloat(newCouponMin) || 0
      });
      alert('Coupon created successfully!');
      setNewCouponCode('');
      setNewCouponVal('');
      setNewCouponMin('');
      loadData();
    } catch (err) {
      alert(err.message || 'Error creating coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-boutique-border/60 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold">
              Internal Atelier Operations
            </span>
            <span className="bg-boutique-forest text-white text-[10px] px-2 py-0.5 rounded font-mono">
              ADMIN MODE
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-boutique-forest mt-1">
            Dispatch &amp; Operations Dashboard
          </h1>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 text-xs text-boutique-forest border border-boutique-border bg-white px-4 py-2 rounded-full font-semibold hover:bg-boutique-paper transition self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Feed</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex border-b border-boutique-border space-x-6 text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-boutique-forest text-boutique-forest'
              : 'border-transparent text-boutique-muted hover:text-boutique-charcoal'
          }`}
        >
          Overview &amp; Metrics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-boutique-forest text-boutique-forest'
              : 'border-transparent text-boutique-muted hover:text-boutique-charcoal'
          }`}
        >
          <span>Live Orders</span>
          <span className="bg-boutique-sageLight text-boutique-sage px-1.5 py-0.5 rounded-full text-[10px]">
            {orders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'products'
              ? 'border-boutique-forest text-boutique-forest'
              : 'border-transparent text-boutique-muted hover:text-boutique-charcoal'
          }`}
        >
          Catalog &amp; Stock
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'coupons'
              ? 'border-boutique-forest text-boutique-forest'
              : 'border-transparent text-boutique-muted hover:text-boutique-charcoal'
          }`}
        >
          Promotional Codes
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs">
              <div className="flex items-center justify-between text-boutique-muted mb-2">
                <span className="text-xs uppercase font-semibold">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-boutique-gold" />
              </div>
              <span className="font-serif font-bold text-3xl text-boutique-forest">
                ${stats.totalRevenue.toFixed(2)}
              </span>
              <p className="text-[11px] text-boutique-muted mt-1">From verified deliveries</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs">
              <div className="flex items-center justify-between text-boutique-muted mb-2">
                <span className="text-xs uppercase font-semibold">Active Consignments</span>
                <Clock className="w-5 h-5 text-boutique-sage" />
              </div>
              <span className="font-serif font-bold text-3xl text-boutique-forest">
                {stats.activeDeliveries}
              </span>
              <p className="text-[11px] text-boutique-sage font-medium mt-1">In kitchen / courier transit</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs">
              <div className="flex items-center justify-between text-boutique-muted mb-2">
                <span className="text-xs uppercase font-semibold">Total Orders</span>
                <Package className="w-5 h-5 text-boutique-rose" />
              </div>
              <span className="font-serif font-bold text-3xl text-boutique-forest">
                {stats.totalOrders}
              </span>
              <p className="text-[11px] text-boutique-muted mt-1">{stats.todayOrders} placed today</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs">
              <div className="flex items-center justify-between text-boutique-muted mb-2">
                <span className="text-xs uppercase font-semibold">Low Stock Alerts</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-serif font-bold text-3xl text-boutique-forest">
                {stats.lowStockCount}
              </span>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Items below 15 units</p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-boutique-forest">
              Recent Order Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-boutique-border text-boutique-muted uppercase text-[10px]">
                    <th className="pb-3">Order Ref</th>
                    <th className="pb-3">Recipient</th>
                    <th className="pb-3">Slot</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-boutique-border/50">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-boutique-cream/50">
                      <td className="py-3 font-mono font-bold text-boutique-forest">{o.orderNumber}</td>
                      <td className="py-3 font-medium text-boutique-charcoal">{o.recipientName}</td>
                      <td className="py-3 text-boutique-muted">{o.deliverySlot}</td>
                      <td className="py-3 font-bold">${o.total.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="bg-boutique-sageLight text-boutique-sage px-2 py-0.5 rounded text-[10px] font-bold">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-boutique-border shadow-xs overflow-hidden">
            <div className="p-6 border-b border-boutique-border/60">
              <h3 className="font-serif font-bold text-lg text-boutique-forest">
                All Customer Orders &amp; Dispatch Statuses
              </h3>
              <p className="text-xs text-boutique-muted">
                Change order status below to immediately update customer real-time tracking screens.
              </p>
            </div>

            <div className="divide-y divide-boutique-border/60">
              {orders.map((ord) => (
                <div key={ord.id} className="p-6 space-y-4 hover:bg-boutique-cream/30 transition">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-boutique-forest">{ord.orderNumber}</span>
                        <span className="text-xs bg-boutique-paper px-2 py-0.5 rounded text-boutique-charcoal">
                          {ord.paymentMethod} • {ord.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-boutique-muted mt-1">
                        Recipient: <strong className="text-boutique-charcoal">{ord.recipientName}</strong> ({ord.recipientPhone}) •{' '}
                        Scheduled for <strong>{ord.deliveryDate}</strong> ({ord.deliverySlot})
                      </p>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-boutique-muted font-medium">Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-white border border-boutique-border rounded-xl text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-boutique-forest shadow-xs"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-boutique-paper/50 p-3 rounded-2xl border border-boutique-border/50 text-xs space-y-1">
                    {ord.items?.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-boutique-charcoal">
                        <span>
                          {it.quantity}x <strong>{it.product?.name}</strong> {it.variantName ? `(${it.variantName})` : ''} {it.customFlavor ? `• Flavor: ${it.customFlavor}` : ''}
                        </span>
                        <span className="font-semibold">${(it.priceAtPurchase * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {ord.deliveryInstructions && (
                      <p className="text-[11px] text-boutique-roseDark pt-1 italic">
                        Special Instructions: "{ord.deliveryInstructions}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Products Management */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left: Product List */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-boutique-border shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-boutique-forest">
              Catalog Items ({products.length})
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-boutique-border">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-serif font-bold text-xs text-boutique-charcoal">{p.name}</h4>
                      <span className="text-[11px] text-boutique-muted">${p.basePrice.toFixed(2)} • Stock: {p.stock}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-boutique-sageLight text-boutique-sage font-semibold px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Add Product Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-boutique-border shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-boutique-forest">
              Add New Atelier Product
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Lavender Honeycomb Pâtisserie"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Category</label>
                <select
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="49.00"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Crafted with French lavender essence..."
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {/* Multi-Photo Manager */}
              <div className="space-y-2 p-3.5 bg-boutique-paper/60 rounded-2xl border border-boutique-border">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-boutique-charcoal">
                    Product Photography ({newProdImages.length} photos)
                  </label>
                  <span className="text-[10px] text-boutique-gold font-bold uppercase tracking-wider">
                    First photo is Cover
                  </span>
                </div>

                {/* Upload Multiple Files Button */}
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer bg-white hover:bg-boutique-cream text-boutique-forest border border-boutique-border px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-boutique-sage" />
                    <span>{uploadingPhotos ? 'Uploading Photos...' : 'Upload Photos from Device'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingPhotos}
                    />
                  </label>
                  <span className="text-[11px] text-boutique-muted">Select multiple files at once</span>
                </div>

                {/* Or Paste URL Form */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Or paste image URL (Unsplash, Cloudinary, S3)..."
                    className="flex-1 bg-white border border-boutique-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="bg-boutique-forest hover:bg-boutique-sage text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Thumbnails Strip */}
                {newProdImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {newProdImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border bg-white aspect-square shadow-xs group ${
                          idx === 0 ? 'border-boutique-forest ring-2 ring-boutique-forest/40' : 'border-boutique-border'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="self-end bg-white/90 text-boutique-roseDark p-1 rounded-full hover:bg-white transition shadow-xs"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetCover(idx)}
                              className="bg-boutique-forest/90 text-white text-[9px] font-bold uppercase py-0.5 px-1.5 rounded-md hover:bg-boutique-forest transition text-center"
                            >
                              Make Cover
                            </button>
                          ) : (
                            <span className="bg-boutique-forest text-white text-[9px] font-bold uppercase py-0.5 px-1.5 rounded-md text-center">
                              ★ Cover
                            </span>
                          )}
                        </div>

                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-boutique-forest/90 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-boutique-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdEggless}
                    onChange={(e) => setNewProdEggless(e.target.checked)}
                    className="accent-boutique-forest"
                  />
                  <span>Eggless</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-boutique-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdCustomizable}
                    onChange={(e) => setNewProdCustomizable(e.target.checked)}
                    className="accent-boutique-forest"
                  />
                  <span>Customizable</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={creatingProduct}
                className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm mt-2"
              >
                {creatingProduct ? 'Creating...' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Coupons Management */}
      {activeTab === 'coupons' && (
        <div className="max-w-xl bg-white p-6 rounded-3xl border border-boutique-border shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-serif font-bold text-lg text-boutique-forest">
            Issue New Promotional Privilege Code
          </h3>
          <form onSubmit={handleCreateCoupon} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                placeholder="e.g. SUMMER15"
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Discount Type</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value)}
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Value</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(e.target.value)}
                  placeholder="15"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-boutique-charcoal mb-1">Minimum Order ($)</label>
              <input
                type="number"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(e.target.value)}
                placeholder="40"
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={creatingCoupon}
              className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              {creatingCoupon ? 'Creating...' : 'Activate Privilege Code'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
