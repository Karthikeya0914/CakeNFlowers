import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, Plus, Trash2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function AccountPage({ onOpenAuthModal }) {
  const { user, addAddress, deleteAddress } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New Address Form
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      api.get('/orders/my-orders')
        .then((data) => setOrders(data.orders || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-boutique-paper mx-auto flex items-center justify-center text-boutique-forest">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-boutique-forest">Sign In to Your Account</h2>
        <p className="text-xs text-boutique-muted">
          Access your past orders, delivery address book, and exclusive Society benefits.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="bg-boutique-forest hover:bg-boutique-sage text-white text-xs font-semibold px-8 py-3 rounded-full uppercase tracking-wider transition"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress({
        recipientName,
        street,
        landmark,
        city,
        state,
        zip,
        phone,
        label: 'Home',
        isDefault: user.addresses?.length === 0
      });
      setShowAddAddr(false);
      setRecipientName('');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setPhone('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-boutique-border/60 pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
            The Atelier Society Patron
          </span>
          <h1 className="text-3xl font-serif font-bold text-boutique-forest mt-1">
            Hello, {user.name}
          </h1>
          <p className="text-xs text-boutique-muted mt-0.5">{user.email} • {user.phone || 'No phone set'}</p>
        </div>

        {user.role === 'ADMIN' && (
          <Link
            to="/admin"
            className="bg-boutique-sageLight text-boutique-forest border border-boutique-sage/30 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-boutique-sage hover:text-white transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Admin Dashboard</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Orders Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-boutique-forest flex items-center gap-2">
              <Package className="w-5 h-5 text-boutique-sage" />
              <span>Your Orders ({orders.length})</span>
            </h2>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-boutique-muted">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-boutique-border text-center space-y-3">
              <p className="text-xs text-boutique-muted">You have not placed any orders yet.</p>
              <Link to="/catalog" className="inline-block text-xs font-semibold text-boutique-forest underline">
                Browse our collections
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-6 rounded-3xl border border-boutique-border shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-boutique-border/40 pb-3 gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-boutique-charcoal">{ord.orderNumber}</span>
                      <span className="text-[11px] text-boutique-muted block">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()} • Scheduled for {ord.deliveryDate} ({ord.deliverySlot})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-full bg-boutique-sageLight text-boutique-sage border border-boutique-sage/20">
                        {ord.status}
                      </span>
                      <span className="font-serif font-bold text-base text-boutique-forest">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex flex-wrap gap-3">
                    {ord.items?.map((it) => (
                      <div key={it.id} className="flex items-center gap-2 text-xs bg-boutique-cream p-2 rounded-xl border border-boutique-border/60">
                        <img src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <span className="font-medium text-boutique-charcoal block truncate max-w-[150px]">{it.product?.name}</span>
                          <span className="text-[10px] text-boutique-muted">Qty: {it.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/track-order?orderNumber=${ord.orderNumber}`}
                      className="text-xs font-semibold text-boutique-forest hover:text-boutique-rose flex items-center gap-1 transition"
                    >
                      <span>Track Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-boutique-forest flex items-center gap-2">
              <MapPin className="w-5 h-5 text-boutique-rose" />
              <span>Saved Addresses</span>
            </h2>
            <button
              onClick={() => setShowAddAddr(!showAddAddr)}
              className="text-xs font-semibold text-boutique-forest hover:text-boutique-rose flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddAddr ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddr && (
            <form onSubmit={handleSaveAddress} className="bg-white p-5 rounded-3xl border border-boutique-border shadow-xs space-y-3 animate-fade-in">
              <h4 className="font-serif font-bold text-sm text-boutique-charcoal">New Destination Address</h4>
              <input
                type="text"
                required
                placeholder="Recipient Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
              />
              <input
                type="tel"
                required
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
              />
              <input
                type="text"
                required
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <input
                type="text"
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="w-full bg-boutique-forest text-white py-2 rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Save Address
              </button>
            </form>
          )}

          {/* List of Addresses */}
          <div className="space-y-3">
            {user.addresses?.map((addr) => (
              <div key={addr.id} className="bg-white p-4 rounded-2xl border border-boutique-border relative space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-xs text-boutique-charcoal">{addr.recipientName}</span>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-boutique-muted hover:text-boutique-roseDark p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-boutique-muted leading-tight">
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}
                </p>
                <p className="text-[11px] text-boutique-muted">Phone: {addr.phone}</p>
                {addr.isDefault && (
                  <span className="text-[10px] bg-boutique-sageLight text-boutique-sage font-bold px-2 py-0.5 rounded inline-block mt-1">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
