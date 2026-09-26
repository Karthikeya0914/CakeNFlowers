import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const OCCASIONS_DATA = [
  {
    id: 'birthday',
    title: 'Birthday Jubilees',
    subtitle: 'Confetti Tiers, Pastel Blossoms & Macarons',
    description: 'Celebrate another glorious spin around the sun with handcrafted Belgian truffle cakes, custom age toppers, and celebratory bouquets.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'anniversary',
    title: 'Anniversary Milestones',
    subtitle: '50 Ecuadorian Crimson Roses & Gold Leaf Cakes',
    description: 'Honor the enduring chapters of romance with long-stem velvety red roses, single-origin chocolate cakes, and bespoke card inscriptions.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'romance',
    title: 'Love & Romance',
    subtitle: 'Intimate Whispers & Fragrant Petals',
    description: 'A delicate expression of devotion featuring French peonies, blush hydrangeas, and artisanal sweet creations made to share.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'congratulations',
    title: 'Congratulations & Graduations',
    subtitle: 'Triumphant Blooms & Champagne Cheesecakes',
    description: 'Salute remarkable accomplishments and milestones with vibrant sunny sunflowers, Basque burnt cheesecakes, and celebratory hampers.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'luxury',
    title: 'VIP Grand Combos',
    subtitle: 'The Atelier Signature Presentation',
    description: 'When only the extraordinary suffices. Orchestrated luxury pairings of multi-tier cakes, imperial floral arrangements, and Parisian sweets.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sympathy',
    title: 'Sympathy & Solace',
    subtitle: 'Pristine Casablanca Lilies & Moon Orchids',
    description: 'Gentle, comforting gestures crafted with pure white oriental lilies and soothing botanical greenery to express your heartfelt condolences.',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=80'
  }
];

export default function OccasionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
          Curated Milestones
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-boutique-forest">
          Celebrations by Occasion
        </h1>
        <p className="text-xs sm:text-sm text-boutique-muted">
          Every moment of joy, reflection, or devotion has its own distinct aesthetic. Select an occasion to explore tailored floral silhouettes and pastries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {OCCASIONS_DATA.map((occ) => (
          <div
            key={occ.id}
            className="group bg-white rounded-3xl border border-boutique-border overflow-hidden shadow-boutique hover:shadow-boutique-hover transition-all duration-500 flex flex-col"
          >
            <div className="aspect-[16/10] overflow-hidden bg-boutique-paper relative">
              <img
                src={occ.image}
                alt={occ.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-boutique-gold block">
                  {occ.subtitle}
                </span>
                <h3 className="font-serif font-bold text-xl text-boutique-forest">
                  {occ.title}
                </h3>
                <p className="text-xs text-boutique-muted leading-relaxed">
                  {occ.description}
                </p>
              </div>

              <Link
                to={`/catalog?occasion=${occ.id}`}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-boutique-forest group-hover:text-boutique-rose transition pt-2"
              >
                <span>Browse {occ.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
