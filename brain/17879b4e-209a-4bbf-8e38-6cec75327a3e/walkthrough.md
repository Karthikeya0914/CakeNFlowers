# Walkthrough — Cake N Flowers Boutique E-Commerce

We have engineered and validated the complete fullstack application for **Cake N Flowers — Atelier Floral & Pâtisserie**, a boutique e-commerce web platform for artisanal cake, bespoke floral, and luxury gift delivery.

The application is structured in `C:\Users\karth\.gemini\antigravity\scratch\cake-n-flowers`.

---

## 🏛 Architecture & Implemented Components

```
cake-n-flowers/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # SQLite schema (instant local dev)
│   │   ├── schema.postgres.prisma   # PostgreSQL schema (Neon/Supabase/Render)
│   │   └── seed.js                  # Database seeder (products, coupons, orders)
│   ├── src/
│   │   ├── controllers/             # Auth, Product, Order, Admin, Coupon, Review
│   │   ├── middleware/              # JWT auth, role guard, error handler
│   │   ├── routes/                  # Express REST routes
│   │   ├── utils/                   # Prisma client, Stripe checkout helper
│   │   └── server.js                # Express app entrypoint
│   ├── test/api.test.js             # Automated API test suite
│   ├── uploads/                     # Uploaded customer photos for cakes
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/client.js            # Fetch API client with Bearer auth
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Authentication & address management
    │   │   └── CartContext.jsx      # Cart items, custom options, coupon calculation
    │   ├── components/
    │   │   ├── layout/              # Navbar, Footer, Announcement Bar
    │   │   ├── product/             # ProductCard, CustomizerModal
    │   │   ├── cart/                # CartDrawer
    │   │   └── auth/                # AuthModal with one-click demo logins
    │   ├── pages/
    │   │   ├── HomePage.jsx         # Hero, occasions, bestsellers, atelier differences
    │   │   ├── CatalogPage.jsx      # Category, dietary, occasion, price filters
    │   │   ├── ProductDetailPage.jsx# Gallery, customizer builder, reviews
    │   │   ├── CheckoutPage.jsx     # Slot scheduling, address, payment
    │   │   ├── OrderConfirmationPage.jsx # Confetti, receipt, tracking link
    │   │   ├── TrackOrderPage.jsx   # 5-stage live dispatch tracker
    │   │   ├── AccountPage.jsx      # Order history, address book
    │   │   ├── OccasionsPage.jsx    # Occasion landing catalog
    │   │   └── admin/AdminDashboard.jsx # KPI stats, order status changer, catalog CRUD
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js           # Custom boutique color tokens & shadows
    ├── vite.config.js               # Proxy configurations
    └── package.json
```

---

## 🎨 Visual Identity & Key Highlights

1. **Editorial Aesthetic**:
   - Typography: Elegant serif headers (`Playfair Display` and `Cormorant Garamond`) paired with modern clean sans (`Plus Jakarta Sans`).
   - Palette: Warm Cream (`#FAF8F5`), Deep Forest Sage (`#1F3025`), Soft Rose Blush (`#F7EBE8`), and Champagne Gold (`#C49E58`).
2. **Interactive Product Customizer**:
   - Weight & portion tiers (500g, 1kg, 2kg or Stem counts).
   - Flavor picker (Belgian 70% Dark Truffle, Madagascar Vanilla Bean, Red Velvet Rose, Salted Caramel, Pistachio).
   - 100% Eggless preparation switch.
   - Cake icing text inscription (e.g., *"Happy 30th Birthday Victoria!"*).
   - Complimentary handwritten botanical card message composer.
   - Photo uploader for edible sugar sheet printing on cakes.
3. **Delivery Slot Scheduler**:
   - Morning (9:00 AM – 1:00 PM)
   - Standard Afternoon (1:00 PM – 6:00 PM)
   - Evening Twilight (6:00 PM – 9:00 PM)
   - Midnight Surprise (11:00 PM – 12:00 AM)
4. **Real-Time 5-Stage Order Tracking**:
   - `CONFIRMED` → `PREPARING` → `QUALITY_PASSED` → `OUT_FOR_DELIVERY` (with van details) → `DELIVERED`.
5. **Operations Admin Portal & Multi-Photo Manager**:
   - Real-time revenue & sales KPI metrics.
   - **Multi-Photo Product Photography**:
     - Bulk upload multiple photos directly from device (up to 10 files simultaneously).
     - Paste external image URLs (Cloudinary, AWS S3, Unsplash).
     - Visual thumbnail grid with "Cover Photo" designation, "Make Cover" reordering, and individual removal.
   - Immediate order status dropdown updates that reflect on customer tracking screens in real-time.
   - Product catalog editor & promotional coupon generator.

---

## 🧪 Verification & Validation Results

### 1. Automated Backend API Tests
We executed the automated backend test suite covering API health, catalog categories, product listings, coupon calculations, and order tracking lookup:
```bash
> cake-n-flowers-backend@1.0.0 test
> node test/api.test.js

Testing Cake N Flowers Backend API...
🌸 Cake N Flowers API running on http://localhost:5000
✔ Health check passed
✔ Categories passed (4 categories)
✔ Products listing passed (11 products)
✔ Coupon validation passed
✔ Order tracking lookup passed

All API automated tests completed successfully! 🎉
```

### 2. Frontend Production Build
We executed `npm run build` with Vite and Tailwind CSS:
```bash
> cake-n-flowers-frontend@1.0.0 build
> vite build

vite v6.4.3 building for production...
transforming...
✓ 1600 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.26 kB │ gzip:  0.71 kB
dist/assets/index-BjhlsvgR.css   35.67 kB │ gzip:  6.81 kB
dist/assets/index-Dqp-PBH5.js   320.08 kB │ gzip: 87.62 kB
✓ built in 6.42s
```
Zero lint, compile, or packaging errors.

---

## 🔑 Pre-seeded Demo Credentials & References

| Entity | Credentials / Reference | Notes |
|---|---|---|
| **Admin Login** | `admin@cakenflowers.com` / `AdminPassword123!` | Access to `/admin` operations dashboard |
| **Customer Login** | `olivia@example.com` / `Customer123!` | Pre-populated addresses and past orders |
| **Active Demo Order** | `CNF-2026-8941` | Live order currently in "OUT_FOR_DELIVERY" status |
| **Discount Coupons** | `WELCOME10` (10% off), `LUXURY20` (20% off), `SWEET5` ($5 off) | Test coupon discounts at checkout |

---

## 🚀 Running the Project

To start the local development servers:

```bash
# Terminal 1: Backend
cd C:\Users\karth\.gemini\antigravity\scratch\cake-n-flowers\backend
npm start

# Terminal 2: Frontend
cd C:\Users\karth\.gemini\antigravity\scratch\cake-n-flowers\frontend
npm run dev
```

Visit `http://localhost:5173` to explore the storefront, customize cakes & flowers, schedule delivery, and track orders in real time.
