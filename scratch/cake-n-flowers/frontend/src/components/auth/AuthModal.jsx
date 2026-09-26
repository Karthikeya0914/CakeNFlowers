import React, { useState } from 'react';
import { X, Sparkles, User, Lock, Mail, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (type) => {
    if (type === 'admin') {
      setEmail('admin@cakenflowers.com');
      setPassword('AdminPassword123!');
    } else {
      setEmail('olivia@example.com');
      setPassword('Customer123!');
    }
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-boutique-forest/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-boutique-border animate-fade-in z-10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-boutique-paper hover:bg-boutique-subtle flex items-center justify-center text-boutique-charcoal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
            The Atelier Society
          </span>
          <h2 className="text-2xl font-serif font-bold text-boutique-forest mt-1">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-boutique-muted mt-1">
            {isRegister
              ? 'Join to save addresses, track orders, and receive private release invites.'
              : 'Sign in to access your bespoke orders and saved delivery addresses.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-boutique-blush border border-boutique-rose/30 flex items-center gap-2 text-xs text-boutique-roseDark font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-boutique-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Olivia Sterling"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-boutique-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="olivia@example.com"
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                Phone (For Delivery SMS)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-boutique-muted absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-boutique-cream border border-boutique-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-boutique-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-boutique-cream border border-boutique-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-boutique-forest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-boutique-forest hover:bg-boutique-sage text-white py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-sm mt-4"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-4 border-t border-boutique-border/60">
          <span className="text-[10px] text-boutique-muted uppercase tracking-wider block text-center mb-2">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser('customer')}
              className="px-2 py-1.5 bg-boutique-paper hover:bg-boutique-subtle text-boutique-charcoal rounded-lg text-[11px] font-medium border border-boutique-border transition"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('admin')}
              className="px-2 py-1.5 bg-boutique-sageLight hover:bg-boutique-sage/20 text-boutique-forest rounded-lg text-[11px] font-medium border border-boutique-sage/30 transition"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Toggle Login / Register */}
        <div className="text-center mt-5 text-xs text-boutique-muted">
          {isRegister ? (
            <span>
              Already a society member?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-boutique-forest font-semibold underline decoration-dotted hover:text-boutique-rose"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Cake N Flowers?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-boutique-forest font-semibold underline decoration-dotted hover:text-boutique-rose"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
