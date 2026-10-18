import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { coupons, orderItems, orders, products, productVariants } from "../db/schema.js";
import { computeDiscount } from "./catalog.js";
import { HttpError, json, parseImages, parseJsonOr, type Ctx } from "./http.js";
import { createCheckoutSession } from "./stripe.js";

type OrderRow = typeof orders.$inferSelect;

// Load each order's items with their product attached (all product fields, or a summary)
export async function withItems(orderRows: OrderRow[], productSummary = false) {
  if (!orderRows.length) return [];
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((o) => o.id)));
  const productIds = [...new Set(items.map((i) => i.productId))];
  const productRows = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];
  const productFor = (id: string) => {
    const p = productRows.find((row) => row.id === id);
    if (!p) return null;
    return productSummary ? { id: p.id, name: p.name, slug: p.slug, images: parseImages(p.images) } : p;
  };
  return orderRows.map((o) => ({
    ...o,
    items: items.filter((i) => i.orderId === o.id).map((i) => ({ ...i, product: productFor(i.productId) })),
  }));
}

// Helper to compute delivery fee based on slot
function calculateDeliveryFee(slot: string, subtotal: number) {
  if (!slot) return 5.0;
  const lower = slot.toLowerCase();
  if (lower.includes("midnight")) return 12.0;
  if (lower.includes("express")) return 8.0;
  if (subtotal >= 70.0) return 0.0; // Free delivery for orders $70+
  return 5.0;
}

// Helper to generate unique human-readable order number
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `CNF-${year}-${randomPart}`;
}

// POST /api/orders
export async function createOrder({ body, user, url }: Ctx) {
  const {
    items,
    deliveryDate,
    deliverySlot,
    deliveryInstructions,
    recipientName,
    recipientPhone,
    shippingAddress,
    guestEmail,
    guestName,
    guestPhone,
    couponCode,
    paymentMethod = "STRIPE",
  } = body;

  if (!items || !items.length) throw new HttpError(400, "Your cart is empty.");
  if (!deliveryDate || !deliverySlot) {
    throw new HttpError(400, "Please select a delivery date and preferred delivery time slot.");
  }
  if (!recipientName || !recipientPhone || !shippingAddress) {
    throw new HttpError(400, "Recipient name, phone, and delivery address are required.");
  }

  // Identify user or guest
  const userId = user ? user.id : null;
  const finalGuestEmail = user ? user.email : guestEmail;
  const finalGuestName = user ? user.name : guestName || recipientName;
  const finalGuestPhone = user ? user.phone || guestPhone : guestPhone;
  if (!userId && !finalGuestEmail) {
    throw new HttpError(400, "Please provide an email address for order notifications.");
  }

  // Verify and compute prices from DB
  const productIds: string[] = items.map((i: any) => String(i.productId));
  const variantIds: string[] = items.map((i: any) => i.variantId).filter(Boolean).map(String);
  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds)) : [],
  ]);

  let subtotal = 0;
  const verifiedItems = items.map((item: any) => {
    const product = productRows.find((p) => p.id === item.productId);
    if (!product || !product.active) {
      throw new HttpError(400, `Product not available: ${item.name || item.productId}`);
    }
    const variant = variantRows.find((v) => v.id === item.variantId && v.productId === product.id);
    const price = product.basePrice + (variant ? variant.priceModifier : 0);
    const quantity = parseInt(item.quantity) || 1;
    subtotal += price * quantity;
    return {
      productId: product.id,
      productName: product.name,
      variantId: variant ? variant.id : null,
      variantName: variant?.name || item.variantName || null,
      quantity,
      customFlavor: item.customFlavor || null,
      customMessageCard: item.customMessageCard || null,
      customPhotoUrl: item.customPhotoUrl || null,
      customInscription: item.customInscription || null,
      isEggless: Boolean(item.isEggless),
      priceAtPurchase: price,
    };
  });

  const deliveryFee = calculateDeliveryFee(deliverySlot, subtotal);

  // Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, String(couponCode).toUpperCase().trim()));
    const now = new Date();
    const inWindow = coupon && coupon.validFrom <= now && (!coupon.validTo || coupon.validTo >= now);
    if (coupon && coupon.active && inWindow && subtotal >= coupon.minOrderAmount) {
      discount = computeDiscount(coupon, subtotal);
      await db
        .update(coupons)
        .set({ usageCount: sql`${coupons.usageCount} + 1` })
        .where(eq(coupons.id, coupon.id));
    }
  }

  const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: generateOrderNumber(),
      userId,
      guestEmail: finalGuestEmail,
      guestName: finalGuestName,
      guestPhone: finalGuestPhone,
      status: "CONFIRMED",
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryDate,
      deliverySlot,
      deliveryInstructions: deliveryInstructions || null,
      recipientName,
      recipientPhone,
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PAID",
      paymentMethod,
    })
    .returning();

  await db.insert(orderItems).values(verifiedItems.map(({ productName: _n, ...it }: any) => ({ ...it, orderId: order.id })));

  // Handle Stripe Session if requested
  let checkoutUrl: string | null = null;
  if (paymentMethod === "STRIPE") {
    const clientUrl = process.env.CLIENT_URL || url.origin;
    const session = await createCheckoutSession({
      orderNumber: order.orderNumber,
      items: verifiedItems,
      customerEmail: finalGuestEmail,
      successUrl: `${clientUrl}/order-confirmed`,
      cancelUrl: `${clientUrl}/checkout`,
    });
    checkoutUrl = session.url;
    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  }

  const [fullOrder] = await withItems([order]);
  return json(
    {
      message: "Order created successfully.",
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      checkoutUrl,
      order: fullOrder,
    },
    201
  );
}

const STAGES = [
  { id: "CONFIRMED", label: "Order Confirmed", description: "Your order has been received and verified." },
  { id: "PREPARING", label: "Artisan Preparation", description: "Pastry chefs & master florists are handcrafting your order." },
  { id: "QUALITY_PASSED", label: "Quality Inspected", description: "Freshness and presentation approved." },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "In transit with temperature-controlled courier." },
  { id: "DELIVERED", label: "Delivered", description: "Hand-delivered to the recipient with care." },
];

// GET /api/orders/track/:orderNumber
export async function getOrderTracking({ params }: Ctx) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, params.orderNumber.trim()));
  if (!order) throw new HttpError(404, "Order not found. Please verify your order number.");

  const [withProducts] = await withItems([order], true);
  const currentStageIndex = STAGES.findIndex((s) => s.id === order.status);

  return json({
    order: {
      ...withProducts,
      shippingAddress: parseJsonOr(order.shippingAddress, order.shippingAddress),
      stages: STAGES,
      currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : 0,
    },
  });
}

// GET /api/orders/my-orders (Protected)
export async function getMyOrders({ user }: Ctx) {
  const rows = await db.select().from(orders).where(eq(orders.userId, user!.id)).orderBy(desc(orders.createdAt));
  const formatted = (await withItems(rows, true)).map((o) => ({
    ...o,
    shippingAddress: parseJsonOr(o.shippingAddress, o.shippingAddress),
  }));
  return json({ orders: formatted });
}

// POST /api/orders/confirm-payment
export async function confirmPayment({ body }: Ctx) {
  const { orderNumber } = body;
  const [updated] = await db
    .update(orders)
    .set({ paymentStatus: "PAID", status: "CONFIRMED" })
    .where(eq(orders.orderNumber, String(orderNumber || "")))
    .returning();
  if (!updated) throw new HttpError(404, "Order not found.");
  return json({ message: "Payment confirmed successfully.", order: updated });
}
