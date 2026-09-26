# Implementation Plan — Cake N Flowers Boutique E-Commerce

A fullstack boutique e-commerce web platform for luxury cake, flower, combo, and artisanal gift delivery. Inspired by the market breadth of reference delivery services but elevated with an editorial aesthetic, bespoke product customization flow, streamlined checkout with delivery slot scheduling, real-time order tracking, and a comprehensive admin management panel.

## User Review Required

> [!IMPORTANT]
> **Database & Environment Recommendation**:
> Since PostgreSQL is not running locally as a system service, we propose configuring Prisma to seamlessly support both:
> 1. **PostgreSQL** for Production/Staging (via Neon, Supabase, or Railway serverless Postgres connection string in `.env`).
> 2. **SQLite / In-Memory Mock mode** as an instant local fallback so development and testing can begin immediately without waiting for database provisioning.

> [!IMPORTANT]
> **Workspace Recommendation**:
> The project files will be created in `C:\Users\karth\.gemini\antigravity\scratch\cake-n-flowers`. We recommend opening or setting this directory as your active workspace in your IDE or editor.

## Open Questions

> [!NOTE]
> **1. Currency & Default Locale**:
> What default currency should be pre-configured for the boutique storefront?
> - Option A: **USD ($)**
> - Option B: **INR (₹)**
> - Option C: **GBP (£) / EUR (€) / AED (AED)**
> *(Note: The codebase will support easy switching via a single environment variable `VITE_CURRENCY`).*

> [!NOTE]
> **2. Checkout Mode**:
> Should customers be permitted to check out as a **Guest** (with optional "save details for next time"), or is creating an account strictly required prior to placing an order?
> - *(Recommended: Guest checkout with automatic order tracking link via email/SMS, which minimizes cart abandonment).*

> [!NOTE]
> **3. Delivery Logistics Approach**:
> Should delivery slots follow an automated cutoff-based schedule (e.g., Morning 9 AM–1 PM, Afternoon 1 PM–6 PM, Express Same-Day 6 PM–9 PM, Midnight 11 PM–12 AM with same-day cutoff times) managed in the admin dashboard, or do you have a specific third-party courier API (e.g. Shiprocket, Dunzo, Uber Direct) to plug in immediately?

---

## Proposed Changes

### Phase 1: Project Initialization & Architecture Scaffolding

Set up the monorepo structure in `C:\Users\karth\.gemini\antigravity\scratch\cake-n-flowers` with separate `backend/` and `frontend/` folders.

---

### Backend (`cake-n-flowers/backend`)

#### [NEW] [package.json](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/package.json)
- Express, `@prisma/client`, `prisma`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `stripe`, `multer` (for photo cake uploads), `express-validator`.

#### [NEW] [prisma/schema.prisma](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/prisma/schema.prisma)
- **User**: `id`, `name`, `email`, `password_hash`, `role` (CUSTOMER, ADMIN), `phone`, `createdAt`.
- **Address**: `id`, `userId`, `label`, `recipientName`, `street`, `landmark`, `city`, `state`, `zip`, `phone`.
- **Category**: `id`, `name`, `slug`, `type` (CAKE, FLOWER, COMBO, GIFT), `image`, `description`.
- **Product**: `id`, `name`, `slug`, `description`, `basePrice`, `categoryId`, `images` (JSON/string array), `isCustomizable`, `hasPhotoUpload`, `stock`, `active`, `ratingAvg`, `reviewsCount`.
- **ProductVariant**: `id`, `productId`, `name` (e.g., "500g", "1kg", "12 Stems", "24 Stems Premium"), `priceModifier`.
- **Order**: `id`, `orderNumber`, `userId` (optional for guests), `guestEmail`, `guestPhone`, `status` (PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED), `subtotal`, `deliveryFee`, `discount`, `total`, `deliveryDate`, `deliverySlot`, `deliveryInstructions`, `recipientName`, `recipientPhone`, `shippingAddress` (JSON), `paymentStatus` (UNPAID, PAID, REFUNDED), `stripeSessionId`, `createdAt`.
- **OrderItem**: `id`, `orderId`, `productId`, `variantId`, `quantity`, `customFlavor`, `customMessageCard`, `customPhotoUrl`, `priceAtPurchase`.
- **Review**: `id`, `productId`, `userId`, `userName`, `rating`, `comment`, `createdAt`.
- **Coupon**: `id`, `code`, `discountType` (PERCENTAGE, FIXED), `discountValue`, `minOrderAmount`, `validFrom`, `validTo`, `active`.

#### [NEW] [prisma/seed.js](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/prisma/seed.js)
- Pre-populates boutique categories (Artisanal Cakes, Fresh Floral Bouquets, Luxury Combos, Curated Hampers).
- Seed products with high-definition imagery, variant configurations (e.g. Belgian Truffle Cake, Red Velvet Bloom, Parisian Rose Bouquet, Lily & Orchids Elegance, Anniversary Surprise Combo), coupons (e.g., `WELCOME10`, `LUXURY20`), and admin credentials (`admin@cakenflowers.com`).

#### [NEW] [src/server.js](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/src/server.js)
- Express entrypoint configuring CORS, JSON body parsers, static upload route, rate limiting, and REST routing.

#### [NEW] [src/routes/](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/src/routes/)
- `authRoutes.js`: Login, register, profile, address management.
- `productRoutes.js`: Catalog listing with filtering (category, occasion, price range, sorting, search) and detail view.
- `orderRoutes.js`: Order placement, Stripe checkout session initiation, guest order status retrieval, user order history.
- `couponRoutes.js`: Validate coupon code against cart total.
- `reviewRoutes.js`: Get and submit verified reviews.
- `adminRoutes.js`: Protected routes for admin sales analytics, order lifecycle management, product creation/updating, stock toggle, and coupon controls.

#### [NEW] [src/utils/stripe.js](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/backend/src/utils/stripe.js)
- Stripe session generation with support for webhook confirmations and test-mode automatic simulation if live API keys are not supplied.

---

### Frontend (`cake-n-flowers/frontend`)

#### [NEW] [package.json & vite.config.js](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/frontend/package.json)
- React 18/19, Vite, React Router v6, Tailwind CSS, Lucide React (editorial minimalist icons), Canvas-confetti (for celebration on order success).

#### [NEW] [tailwind.config.js & src/index.css](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/frontend/src/index.css)
- Custom boutique styling tokens:
  - Palette: Warm Cream (`#FAF7F2`), Blush Pink (`#F5E6E8`), Deep Forest Sage (`#2E473B`), Champagne Gold (`#D4AF37`), Velvety Charcoal (`#1F2421`).
  - Fonts: Serif headings (`Playfair Display` / `Cormorant Garamond`) paired with crisp sans-serif (`Plus Jakarta Sans` / `Inter`).
  - Motion tokens: Soft hover zooms, glassmorphism overlays, custom slide drawers.

#### [NEW] [src/context/](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/frontend/src/context/)
- `AuthContext.jsx`: JWT session management, guest/user state, saved addresses.
- `CartContext.jsx`: LocalStorage-persisted cart, variant calculations, custom card messages, photo uploads, coupon discounts.

#### [NEW] [src/components/](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/frontend/src/components/)
- **Layout**: `Navbar` (curated mega-menu, cart badge, search modal, mobile drawer), `Footer` (boutique brand story, occasion links, newsletter, trust badges), `AnnouncementBar` (Same-day delivery cutoff timer).
- **Product**:
  - `ProductCard`: Editorial layout, quick-view, flavor preview tags, hover imagery reveal.
  - `CustomizerModal` & `CakeBuilder`: Interactive flavor selector (Belgian Chocolate, Vanilla Bean, Red Velvet, Salted Caramel), weight/size selector (500g, 1kg, 2kg, etc.), cake inscription input ("Happy Birthday Olivia!"), free personalized message card writer, and photo cake image upload preview.
- **Cart & Checkout**:
  - `CartDrawer`: Slide-over cart with instant add-on suggestions (candles, luxury greeting cards, party toppers).
  - `DeliveryScheduler`: Calendar date picker + time slot selector (Standard Morning 9am-1pm, Evening 5pm-8pm, Midnight Surprise 11pm-12am) with same-day cutoff warning.
- **Order Tracking**:
  - `OrderTracker`: Visual multi-step progress bar (Order Placed → Baker Crafting & Floral Arranging → Quality Passed → Out with Courier → Delivered) with live timestamps.

#### [NEW] [src/pages/](file:///C:/Users/karth/.gemini/antigravity/scratch/cake-n-flowers/frontend/src/pages/)
- `HomePage.jsx`: Hero editorial banner, "Curated for the Moment" occasion grid (Birthday, Anniversary, Romance, Congratulatory), Bestselling Cakes & Florals, Customer Testimonials, Delivery Promise.
- `CatalogPage.jsx`: Filterable product catalog by category (Cakes, Flowers, Combos, Hampers), dietary tags (Eggless / Vegan / Gluten-free), price range, sorting.
- `ProductDetailPage.jsx`: High-resolution gallery, comprehensive customization form, delivery pincode check, customer reviews and star breakdown.
- `CheckoutPage.jsx`: Multi-step sleek checkout (Shipping Address → Delivery Slot & Inscription → Payment with Stripe or Demo Sandbox).
- `OrderConfirmationPage.jsx`: Order receipt, delivery time summary, interactive order tracking button, confetti celebration.
- `TrackOrderPage.jsx`: Lookup order by Order ID and Phone/Email with real-time status.
- `AccountPage.jsx`: Order history, re-order button, saved addresses.
- `admin/`:
  - `AdminDashboard.jsx`: Revenue metrics, recent orders table, low stock alerts.
  - `AdminOrders.jsx`: Live order manager with status update dropdowns and customer delivery notes.
  - `AdminProducts.jsx`: Add/Edit/Delete products, manage variants, upload pictures, set active/inactive.
  - `AdminCoupons.jsx`: Create promo codes with percentage/fixed discounts.

---

## Verification Plan

### Automated Tests & Build Verification
1. **Backend Verification**:
   - `npm test` or automated API test script verifying:
     - Auth: Register & Login JWT generation.
     - Products: List and detail query filtering.
     - Cart & Coupon: Coupon calculation (`WELCOME10`).
     - Order Creation: Validating delivery date/slot validation and order storage.
2. **Frontend Build**:
   - `npm run build` in `frontend/` to confirm zero lint/type/Vite packaging errors.

### Manual Verification
1. **Catalog & Customization Flow**:
   - Browse to a customizable cake (e.g. Belgian Truffle).
   - Select weight (1kg), flavor (Dark Truffle), eggless preference, type a cake message ("Happy Anniversary"), and add a personalized card note.
   - Verify cart drawer reflects customizations and calculated pricing.
2. **Delivery Slot & Checkout**:
   - Select tomorrow's date and "Midnight Surprise (11:00 PM - 12:00 AM)".
   - Apply coupon `WELCOME10` to observe the discount applied.
   - Complete checkout and verify transition to the Order Confirmation page.
3. **Live Order Tracking**:
   - Open `/track-order` with the generated order number.
   - In another browser tab/window, access `/admin/orders` as admin and update status from "Preparing" to "Out for Delivery".
   - Verify the tracker reflects the updated status.
4. **Responsive & Visual Inspection**:
   - Test on desktop and mobile viewport to ensure editorial boutique typography, smooth drawer animations, and touch-friendly controls.
