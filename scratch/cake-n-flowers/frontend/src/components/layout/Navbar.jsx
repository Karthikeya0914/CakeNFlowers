import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Sparkles, Clock, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAuthModal }) {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-boutique-cream/95 backdrop-blur-md border-b border-boutique-border/60 transition-all">
      {/* Editorial Announcement Bar */}
      <div className="bg-boutique-forest text-boutique-goldLight text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-boutique-gold animate-pulse" />
        <span>Complimentary temperature-controlled delivery on orders over $70. Use code <strong className="text-boutique-gold underline decoration-dotted">WELCOME10</strong> for 10% off.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-boutique-forest p-2 hover:text-boutique-gold transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Boutique Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-2xl sm:text-3xl font-serif tracking-tight font-bold text-boutique-forest group-hover:text-boutique-sage transition duration-300">
                  Cake <span className="font-ornate italic font-normal text-boutique-rose">&amp;</span> Flowers
                </span>
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-boutique-gold font-medium text-center lg:text-left">
                Atelier Floral &amp; Pâtisserie
              </p>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-boutique-charcoal">
            <Link to="/catalog" className="hover:text-boutique-roseDark transition">All Collections</Link>
            <Link to="/catalog?category=cakes" className="hover:text-boutique-roseDark transition">Artisanal Cakes</Link>
            <Link to="/catalog?category=flowers" className="hover:text-boutique-roseDark transition">Bespoke Florals</Link>
            <Link to="/catalog?category=combos" className="hover:text-boutique-roseDark transition">Luxury Combos</Link>
            <Link to="/occasions" className="hover:text-boutique-roseDark transition">Occasions</Link>
            <Link to="/track-order" className="flex items-center gap-1.5 text-boutique-sage hover:text-boutique-forest transition">
              <Clock className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-boutique-forest hover:text-boutique-gold transition p-1.5 rounded-full hover:bg-boutique-paper"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account / User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold py-1 px-2.5 rounded-full border border-boutique-border text-boutique-forest hover:border-boutique-gold transition">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-boutique-border rounded-xl shadow-boutique py-2 hidden group-hover:block transition animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-boutique-border/50 text-xs text-boutique-muted">
                    Signed in as <br /><strong className="text-boutique-charcoal">{user.email}</strong>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-xs text-boutique-forest font-semibold hover:bg-boutique-sageLight flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-boutique-sage" /> Admin Portal
                    </Link>
                  )}
                  <Link to="/account" className="block px-4 py-2 text-xs text-boutique-charcoal hover:bg-boutique-paper">
                    My Orders &amp; Addresses
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-boutique-roseDark hover:bg-boutique-blush/40"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-boutique-forest hover:text-boutique-gold text-xs font-semibold uppercase tracking-wider transition p-1.5 hover:bg-boutique-paper rounded-full"
                aria-label="Sign in"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-boutique-forest text-boutique-cream p-2.5 rounded-full hover:bg-boutique-sage transition shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-boutique-rose text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-boutique-cream">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Search Bar */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-boutique-border/40 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artisanal cakes, fresh roses, gift hampers..."
                className="flex-1 bg-white border border-boutique-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-boutique-gold"
                autoFocus
              />
              <button
                type="submit"
                className="bg-boutique-forest text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-boutique-sage transition"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-boutique-border/50 py-4 space-y-3 animate-fade-in">
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-charcoal hover:bg-boutique-paper rounded"
            >
              All Collections
            </Link>
            <Link
              to="/catalog?category=cakes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-charcoal hover:bg-boutique-paper rounded"
            >
              Artisanal Cakes
            </Link>
            <Link
              to="/catalog?category=flowers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-charcoal hover:bg-boutique-paper rounded"
            >
              Bespoke Florals
            </Link>
            <Link
              to="/catalog?category=combos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-charcoal hover:bg-boutique-paper rounded"
            >
              Luxury Combos
            </Link>
            <Link
              to="/occasions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-charcoal hover:bg-boutique-paper rounded"
            >
              Occasions
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-boutique-sage hover:bg-boutique-paper rounded"
            >
              Track Order
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-boutique-forest bg-boutique-sageLight rounded"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
