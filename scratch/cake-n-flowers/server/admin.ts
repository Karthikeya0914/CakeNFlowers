import { count, desc, eq, ilike, lte, or, and, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, coupons, orders, products, productVariants, users } from "../db/schema.js";
import { HttpError, json, parseImages, type Ctx } from "./http.js";
import { withItems } from "./orders.js";

async function productWithVariantsAndCategory(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) throw new HttpError(404, "Product not found.");
  const [variants, [category]] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
    db.select().from(categories).where(eq(categories.id, product.categoryId)),
  ]);
  return { ...product, images: parseImages(product.images), variants, category };
}

// GET /api/admin/dashboard
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allOrders, recentRows, lowStockProducts, [{ categoriesCount }], [{ customersCount }]] = await Promise.all([
    db.select({ total: orders.total, status: orders.status, createdAt: orders.createdAt }).from(orders),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db
      .select({ id: products.id, name: products.name, stock: products.stock, basePrice: products.basePrice })
      .from(products)
      .where(lte(products.stock, 15)),
    db.select({ categoriesCount: count() }).from(categories),
    db.select({ customersCount: count() }).from(users).where(eq(users.role, "CUSTOMER")),
  ]);

  const recentOrders = (await withItems(recentRows)).map((o) => ({
    ...o,
    items: o.items.map((i) => ({ ...i, product: i.product ? { name: (i.product as any).name } : null })),
  }));

  const totalRevenue = allOrders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0);

  return json({
    stats: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: allOrders.length,
      todayOrders: allOrders.filter((o) => o.createdAt >= today).length,
      activeDeliveries: allOrders.filter((o) =>
        ["CONFIRMED", "PREPARING", "QUALITY_PASSED", "OUT_FOR_DELIVERY"].includes(o.status)
      ).length,
      lowStockCount: lowStockProducts.length,
      categoriesCount,
      customersCount,
    },
    recentOrders,
    lowStockProducts,
  });
}

// GET /api/admin/orders
export async function getAllOrders({ query }: Ctx) {
  const status = query.get("status");
  const search = query.get("search");

  const conds: (SQL | undefined)[] = [];
  if (status && status !== "ALL") conds.push(eq(orders.status, status));
  if (search) {
    const q = `%${search.trim()}%`;
    conds.push(or(ilike(orders.orderNumber, q), ilike(orders.recipientName, q), ilike(orders.guestEmail, q)));
  }

  const rows = await db
    .select()
    .from(orders)
    .where(and(...conds))
    .orderBy(desc(orders.createdAt));
  return json({ orders: await withItems(rows) });
}

// PUT /api/admin/orders/:id/status
export async function updateOrderStatus({ params, body }: Ctx) {
  const { status, courierName, trackingNumber, notes, paymentStatus } = body;

  const data: Partial<typeof orders.$inferInsert> = {};
  if (status) data.status = status;
  if (courierName !== undefined) data.courierName = courierName;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (notes !== undefined) data.notes = notes;
  if (paymentStatus) data.paymentStatus = paymentStatus;
  if (!Object.keys(data).length) throw new HttpError(400, "No order changes provided.");

  const [updated] = await db.update(orders).set(data).where(eq(orders.id, params.id)).returning();
  if (!updated) throw new HttpError(404, "Order not found.");

  const [order] = await withItems([updated]);
  return json({
    message: "Order status updated successfully.",
    order: { ...order, items: order.items.map(({ product: _p, ...i }) => i) },
  });
}

// POST /api/admin/products
export async function createProduct({ body }: Ctx) {
  const { name, slug, description, basePrice, categoryId, images, isCustomizable, hasPhotoUpload, isEggless, stock, occasionTags, variants } =
    body;

  if (!name || !description || !basePrice || !categoryId) {
    throw new HttpError(400, "Name, description, basePrice, and categoryId are required.");
  }

  const finalSlug =
    slug ||
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [product] = await db
    .insert(products)
    .values({
      name,
      slug: finalSlug,
      description,
      basePrice: parseFloat(basePrice),
      categoryId,
      images: typeof images === "string" ? images : JSON.stringify(images || []),
      isCustomizable: Boolean(isCustomizable),
      hasPhotoUpload: Boolean(hasPhotoUpload),
      isEggless: Boolean(isEggless),
      stock: parseInt(stock) || 50,
      occasionTags: occasionTags || "",
    })
    .returning();

  if (variants && variants.length) {
    await db.insert(productVariants).values(
      variants.map((v: any) => ({
        productId: product.id,
        name: v.name,
        priceModifier: parseFloat(v.priceModifier) || 0.0,
        isDefault: Boolean(v.isDefault),
      }))
    );
  }

  return json({ message: "Product created successfully.", product: await productWithVariantsAndCategory(product.id) }, 201);
}

// PUT /api/admin/products/:id
export async function updateProduct({ params, body }: Ctx) {
  const { name, description, basePrice, categoryId, images, isCustomizable, hasPhotoUpload, isEggless, stock, active, occasionTags } = body;

  const data: Partial<typeof products.$inferInsert> = {};
  if (name) data.name = name;
  if (description) data.description = description;
  if (basePrice !== undefined) data.basePrice = parseFloat(basePrice);
  if (categoryId) data.categoryId = categoryId;
  if (images !== undefined) data.images = typeof images === "string" ? images : JSON.stringify(images);
  if (isCustomizable !== undefined) data.isCustomizable = Boolean(isCustomizable);
  if (hasPhotoUpload !== undefined) data.hasPhotoUpload = Boolean(hasPhotoUpload);
  if (isEggless !== undefined) data.isEggless = Boolean(isEggless);
  if (stock !== undefined) data.stock = parseInt(stock);
  if (active !== undefined) data.active = Boolean(active);
  if (occasionTags !== undefined) data.occasionTags = occasionTags;

  if (Object.keys(data).length) {
    await db.update(products).set(data).where(eq(products.id, params.id));
  }
  return json({ message: "Product updated successfully.", product: await productWithVariantsAndCategory(params.id) });
}

// DELETE /api/admin/products/:id
export async function deleteProduct({ params }: Ctx) {
  const [deleted] = await db.delete(products).where(eq(products.id, params.id)).returning({ id: products.id });
  if (!deleted) throw new HttpError(404, "Product not found.");
  return json({ message: "Product deleted." });
}

// POST /api/admin/coupons
export async function createCoupon({ body }: Ctx) {
  const { code, discountType, discountValue, minOrderAmount, validTo } = body;
  if (!code || !discountType || discountValue === undefined) {
    throw new HttpError(400, "Code, discountType, and discountValue are required.");
  }

  const [coupon] = await db
    .insert(coupons)
    .values({
      code: String(code).toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount) || 0.0,
      validTo: validTo ? new Date(validTo) : null,
    })
    .returning();

  return json({ coupon }, 201);
}
