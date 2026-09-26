# Cake N Flowers — Atelier Floral & Pâtisserie

A fullstack boutique e-commerce web platform for luxury cake, flower, combo, and artisanal gift delivery. Inspired by the breadth of high-volume delivery services but elevated with an editorial boutique visual identity, bespoke product customization flow, scheduled delivery slot selection (including midnight surprise delivery), real-time order tracking, and a comprehensive admin management portal.

---

## ✨ Key Features & Differentiators

- **Editorial Boutique Aesthetic**: Designed with an intentional haute pâtisserie palette (blush cream, deep forest sage, warm champagne gold, velvety charcoal) paired with classic serif typography (`Playfair Display` and `Cormorant Garamond`) and clean modern sans.
- **Bespoke Product Customizer**:
  - Multi-tier weight / stem count selection (500g, 1kg, 2kg or 24, 50, 100 stems).
  - Gourmet artisan filling picker (Belgian 70% Dark Truffle, Madagascar Vanilla Bean, Red Velvet Rose, Salted Caramel, Pistachio).
  - 100% Eggless preparation toggle.
  - Cake icing text inscription (e.g. *"Happy 30th Birthday Victoria!"*).
  - Complimentary handwritten botanical card message composer.
  - Custom photo uploader for edible sugar sheet printing.
- **Scheduled White-Glove Delivery**:
  - Morning (9:00 AM – 1:00 PM)
  - Standard Afternoon (1:00 PM – 6:00 PM)
  - Evening Twilight (6:00 PM – 9:00 PM)
  - Midnight Surprise (11:00 PM – 12:00 AM)
  - Same-day cutoff validation and pincode checking.
- **Real-Time Visual Order Tracker**:
  - Live 5-stage progress indicator: *Confirmed → Artisan Kitchen & Florist Preparation → Quality Inspected → Out for Delivery (with temperature-controlled courier van info) → Delivered*.
- **Admin Operations Portal**:
  - Real-time revenue & sales KPI metrics.
  - Live orders list with one-click status transition dropdown.
  - Catalog product manager with image uploads, variants, and stock counters.
  - Promotional discount coupon generator (Percentage & Fixed).
- **Dual Database Architecture**:
  - Native SQLite out-of-the-box for instant local development with zero dependencies.
  - PostgreSQL schema ready for instant deployment to Neon, Supabase, Railway, or Render.
- **Payments**:
  - Stripe integration (Checkout Sessions / Payment Intents) with graceful sandbox simulation mode.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express, REST API |
| **Database & ORM** | Prisma ORM with SQLite (local) & PostgreSQL (production) |
| **Authentication** | JWT (JSON Web Tokens) with Bcrypt hashing & Role-Based Access Control |
| **Payments** | Stripe API + sandbox fallback |
| **File Storage** | Multer local static uploads (`/uploads`) / Cloudinary / S3 |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm installed

### 1. Clone or Open Workspace
Ensure your active workspace is set to:
```bash
cake-n-flowers/
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm start
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The storefront will launch on `http://localhost:5173`.

---

## 🔑 Demo Accounts

The database seed automatically provisions the following accounts:

| Role | Email | Password | Features |
|---|---|---|---|
| **Administrator** | `admin@cakenflowers.com` | `AdminPassword123!` | Access to `/admin` dashboard, order status updater, inventory, and coupon creation |
| **Customer** | `olivia@example.com` | `Customer123!` | Pre-filled Manhattan address, past orders, live order tracking |

*(Note: The login dialog includes one-click "Demo Customer" and "Demo Admin" autofill buttons for convenience!)*

---

## 📦 Active Demo Order Reference

To test the live tracking pipeline without placing a new order:
- Visit: `http://localhost:5173/track-order`
- Enter Order Number: **`CNF-2026-8941`**
- Go to `/admin` as Admin to change its status (e.g. from *Out for Delivery* to *Delivered*) and watch the tracker update in real-time.

---

## 🎟 Pre-seeded Promotional Coupons

- **`WELCOME10`**: 10% off (Min. Order $40)
- **`LUXURY20`**: 20% off (Min. Order $80)
- **`SWEET5`**: $5.00 flat discount (Min. Order $30)

---

## 📁 Repository Structure

```
cake-n-flowers/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # SQLite schema (local dev)
│   │   ├── schema.postgres.prisma   # PostgreSQL schema (production)
│   │   └── seed.js                  # Rich boutique catalog seeder
│   ├── src/
│   │   ├── controllers/             # Auth, Product, Order, Admin, Coupon, Review
│   │   ├── middleware/              # JWT auth, role guard, error handler
│   │   ├── routes/                  # Express REST routes
│   │   ├── utils/                   # Prisma singleton, Stripe helper
│   │   └── server.js                # Express app entrypoint
│   ├── test/
│   │   └── api.test.js              # Automated API test suite
│   ├── uploads/                     # Uploaded customer photos for cakes
│   └── package.json
│
├── frontend/
│   ├── index.html                   # Fonts: Playfair Display, Cormorant Garamond, Plus Jakarta Sans
│   ├── tailwind.config.js           # Custom boutique color tokens & shadows
│   ├── vite.config.js               # Proxy configurations
│   ├── src/
│   │   ├── api/client.js            # Fetch API client with Bearer auth
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication & address state
│   │   │   └── CartContext.jsx      # Shopping bag, customization, coupon calculation
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Footer, Announcement Bar
│   │   │   ├── product/             # ProductCard, CustomizerModal, CakeBuilder
│   │   │   ├── cart/                # CartDrawer
│   │   │   └── auth/                # AuthModal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Hero, occasions, bestsellers, atelier difference
│   │   │   ├── CatalogPage.jsx      # Category, dietary, occasion, price filters
│   │   │   ├── ProductDetailPage.jsx# High-res gallery, customizer, reviews
│   │   │   ├── CheckoutPage.jsx     # Slot scheduling, address, payment
│   │   │   ├── OrderConfirmationPage.jsx # Confetti, receipt, tracking link
│   │   │   ├── TrackOrderPage.jsx   # 5-stage live dispatch tracker
│   │   │   ├── AccountPage.jsx      # Order history, address book
│   │   │   ├── OccasionsPage.jsx    # Occasion landing catalog
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx # KPI stats, order status changer, catalog CRUD
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```
