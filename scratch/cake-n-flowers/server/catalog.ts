import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, coupons, products, productVariants, reviews } from "../db/schema.js";
import { HttpError, json, parseImages, type Ctx } from "./http.js";

type ProductRow = typeof products.$inferSelect;

// Attach variants and a category summary to product rows, as the storefront expects
export async function withVariantsAndCategory(rows: ProductRow[]) {
  if (!rows.length) return [];
  const ids = rows.map((p) => p.id);
  const [variantRows, categoryRows] = await Promise.all([
    db.select().from(productVariants).where(inArray(productVariants.productId, ids)),
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug, type: categories.type })
      .from(categories)
      .where(inArray(categories.id, [...new Set(rows.map((p) => p.categoryId))])),
  ]);
  return rows.map((p) => ({
    ...p,
    images: parseImages(p.images),
    category: categoryRows.find((c) => c.id === p.categoryId) ?? null,
    variants: variantRows.filter((v) => v.productId === p.id),
  }));
}

// GET /api/products
export async function getProducts({ query }: Ctx) {
  const category = query.get("category");
  const type = query.get("type");
  const occasion = query.get("occasion");
  const search = query.get("search");
  const minPrice = query.get("minPrice");
  const maxPrice = query.get("maxPrice");
  const sort = query.get("sort");
  const limit = query.get("limit");
  const page = query.get("page");

  const conds: (SQL | undefined)[] = [eq(products.active, true)];
  if (category) conds.push(eq(categories.slug, category));
  if (type) conds.push(eq(categories.type, type.toUpperCase()));
  if (occasion) conds.push(ilike(products.occasionTags, `%${occasion.toLowerCase()}%`));
  if (query.get("isEggless") === "true") conds.push(eq(products.isEggless, true));
  if (minPrice) conds.push(gte(products.basePrice, parseFloat(minPrice)));
  if (maxPrice) conds.push(lte(products.basePrice, parseFloat(maxPrice)));
  if (search) {
    const q = `%${search.trim()}%`;
    conds.push(or(ilike(products.name, q), ilike(products.description, q), ilike(products.occasionTags, q)));
  }
  const where = and(...conds);

  let orderBy = desc(products.createdAt);
  if (sort === "price_asc") orderBy = asc(products.basePrice);
  if (sort === "price_desc") orderBy = desc(products.basePrice);
  if (sort === "rating") orderBy = desc(products.ratingAvg);
  if (sort === "popular") orderBy = desc(products.reviewsCount);

  const take = limit ? parseInt(limit) || 50 : 50;
  const currentPage = page ? parseInt(page) || 1 : 1;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ product: products })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(orderBy, asc(products.id))
      .limit(take)
      .offset((currentPage - 1) * take),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return json({
    products: await withVariantsAndCategory(rows.map((r) => r.product)),
    total,
    page: currentPage,
    totalPages: Math.ceil(total / take),
  });
}

// GET /api/products/featured
export async function getFeaturedProducts() {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.ratingAvg), asc(products.id))
    .limit(8);
  return json({ bestsellers: await withVariantsAndCategory(rows) });
}

// GET /api/products/:slug
export async function getProductBySlug({ params }: Ctx) {
  const [product] = await db.select().from(products).where(eq(products.slug, params.slug));
  if (!product) throw new HttpError(404, "Product not found.");

  const [[category], variants, productReviews] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, product.categoryId)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.priceModifier)),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20),
  ]);

  return json({
    product: { ...product, images: parseImages(product.images), category, variants, reviews: productReviews },
  });
}

// GET /api/categories
export async function getCategories() {
  const rows = await db
    .select({ category: categories, productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
  return json({
    categories: rows.map((r) => ({ ...r.category, _count: { products: r.productCount } })),
  });
}

// GET /api/categories/:slug
export async function getCategoryBySlug({ params }: Ctx) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, params.slug));
  if (!category) throw new HttpError(404, "Category not found.");

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, category.id), eq(products.active, true)));
  const withVariants = await withVariantsAndCategory(rows);
  return json({ category: { ...category, products: withVariants.map(({ category: _c, ...p }) => p) } });
}

// GET /api/reviews/product/:productId
export async function getReviewsByProduct({ params }: Ctx) {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, params.productId))
    .orderBy(desc(reviews.createdAt));
  return json({ reviews: rows });
}

// POST /api/reviews
export async function createReview({ body, user }: Ctx) {
  const { productId, rating, comment, userName } = body;
  if (!productId || !rating || !comment) {
    throw new HttpError(400, "Product ID, rating, and review comment are required.");
  }

  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId));
  if (!product) throw new HttpError(404, "Product not found.");

  const [review] = await db
    .insert(reviews)
    .values({
      productId,
      userId: user ? user.id : null,
      userName: user ? user.name : userName || "Verified Guest",
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      comment: String(comment).trim(),
    })
    .returning();

  // Recalculate product rating average
  const [stats] = await db
    .select({ total: count(), avg: sql<string>`avg(${reviews.rating})` })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  const ratingAvg = Math.round(parseFloat(stats.avg) * 10) / 10;

  await db.update(products).set({ ratingAvg, reviewsCount: stats.total }).where(eq(products.id, productId));

  return json({ review, ratingAvg, reviewsCount: stats.total }, 201);
}

// Shared coupon lookup + discount calculation
export function computeDiscount(coupon: typeof coupons.$inferSelect, subtotal: number) {
  const raw =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, subtotal);
  return Math.round(raw * 100) / 100;
}

// POST /api/coupons/validate
export async function validateCoupon({ body }: Ctx) {
  const { code, subtotal } = body;
  if (!code) throw new HttpError(400, "Please enter a coupon code.");

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, String(code).toUpperCase().trim()));
  if (!coupon || !coupon.active) throw new HttpError(404, "Invalid or inactive promotional code.");

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) throw new HttpError(400, "This coupon is not yet active.");
  if (coupon.validTo && coupon.validTo < now) throw new HttpError(400, "This coupon code has expired.");

  const orderAmount = parseFloat(subtotal) || 0;
  if (orderAmount < coupon.minOrderAmount) {
    throw new HttpError(400, `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this code.`);
  }

  return json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount: computeDiscount(coupon, orderAmount),
  });
}
