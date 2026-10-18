import { sql } from "drizzle-orm";
import { pgTable, text, boolean, integer, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";

const id = () => text().primaryKey().default(sql`gen_random_uuid()::text`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const users = pgTable("users", {
  id: id(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text().notNull().default("CUSTOMER"), // CUSTOMER, ADMIN
  phone: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const addresses = pgTable(
  "addresses",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    label: text().default("Home"),
    recipientName: text("recipient_name").notNull(),
    street: text().notNull(),
    landmark: text(),
    city: text().notNull(),
    state: text().notNull(),
    zip: text().notNull(),
    phone: text().notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("addresses_user_id_idx").on(t.userId)]
);

export const categories = pgTable("categories", {
  id: id(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  type: text().notNull(), // CAKE, FLOWER, COMBO, GIFT
  description: text(),
  image: text(),
  createdAt: createdAt(),
});

export const products = pgTable(
  "products",
  {
    id: id(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    basePrice: doublePrecision("base_price").notNull(),
    categoryId: text("category_id").notNull().references(() => categories.id),
    images: text().notNull().default("[]"), // JSON string array of image URLs
    isCustomizable: boolean("is_customizable").notNull().default(false),
    hasPhotoUpload: boolean("has_photo_upload").notNull().default(false),
    isEggless: boolean("is_eggless").notNull().default(false),
    stock: integer().notNull().default(50),
    active: boolean().notNull().default(true),
    ratingAvg: doublePrecision("rating_avg").notNull().default(4.9),
    reviewsCount: integer("reviews_count").notNull().default(12),
    occasionTags: text("occasion_tags"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_id_idx").on(t.categoryId)]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: id(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text().notNull(),
    priceModifier: doublePrecision("price_modifier").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (t) => [index("product_variants_product_id_idx").on(t.productId)]
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    guestEmail: text("guest_email"),
    guestName: text("guest_name"),
    guestPhone: text("guest_phone"),
    status: text().notNull().default("CONFIRMED"),
    subtotal: doublePrecision().notNull(),
    deliveryFee: doublePrecision("delivery_fee").notNull().default(0),
    discount: doublePrecision().notNull().default(0),
    total: doublePrecision().notNull(),
    deliveryDate: text("delivery_date").notNull(),
    deliverySlot: text("delivery_slot").notNull(),
    deliveryInstructions: text("delivery_instructions"),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    paymentStatus: text("payment_status").notNull().default("PAID"),
    paymentMethod: text("payment_method").notNull().default("STRIPE"),
    stripeSessionId: text("stripe_session_id"),
    courierName: text("courier_name"),
    trackingNumber: text("tracking_number"),
    notes: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_user_id_idx").on(t.userId)]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.id),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    variantName: text("variant_name"),
    quantity: integer().notNull().default(1),
    customFlavor: text("custom_flavor"),
    customMessageCard: text("custom_message_card"),
    customPhotoUrl: text("custom_photo_url"),
    customInscription: text("custom_inscription"),
    isEggless: boolean("is_eggless").notNull().default(false),
    priceAtPurchase: doublePrecision("price_at_purchase").notNull(),
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    userName: text("user_name").notNull(),
    rating: integer().notNull().default(5),
    comment: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_product_id_idx").on(t.productId)]
);

export const coupons = pgTable("coupons", {
  id: id(),
  code: text().notNull().unique(),
  discountType: text("discount_type").notNull(), // PERCENTAGE, FIXED
  discountValue: doublePrecision("discount_value").notNull(),
  minOrderAmount: doublePrecision("min_order_amount").notNull().default(0),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull().defaultNow(),
  validTo: timestamp("valid_to", { withTimezone: true }),
  active: boolean().notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
});
