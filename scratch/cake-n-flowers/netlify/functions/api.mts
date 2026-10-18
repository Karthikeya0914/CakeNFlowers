import type { Config } from "@netlify/functions";
import { HttpError, json, optionalAuth, requireAdmin, requireAuth, type Handler } from "../../server/http.js";
import * as catalog from "../../server/catalog.js";
import * as auth from "../../server/auth.js";
import * as orderApi from "../../server/orders.js";
import * as admin from "../../server/admin.js";
import { uploadPhoto, uploadPhotos, uploadsStore } from "../../server/uploads.js";

const routes: [string, string, Handler][] = [
  ["GET", "/api/health", async () => json({ status: "online", service: "Cake N Flowers Boutique API", version: "1.0.0", timestamp: new Date().toISOString() })],
  ["POST", "/api/auth/register", auth.register],
  ["POST", "/api/auth/login", auth.login],
  ["GET", "/api/auth/me", requireAuth(auth.getMe)],
  ["POST", "/api/auth/addresses", requireAuth(auth.addAddress)],
  ["DELETE", "/api/auth/addresses/:id", requireAuth(auth.deleteAddress)],
  ["GET", "/api/categories", catalog.getCategories],
  ["GET", "/api/categories/:slug", catalog.getCategoryBySlug],
  ["GET", "/api/products", catalog.getProducts],
  ["GET", "/api/products/featured", catalog.getFeaturedProducts],
  ["GET", "/api/products/:slug", catalog.getProductBySlug],
  ["POST", "/api/orders", optionalAuth(orderApi.createOrder)],
  ["POST", "/api/orders/confirm-payment", orderApi.confirmPayment],
  ["GET", "/api/orders/track/:orderNumber", orderApi.getOrderTracking],
  ["GET", "/api/orders/my-orders", requireAuth(orderApi.getMyOrders)],
  ["POST", "/api/coupons/validate", catalog.validateCoupon],
  ["GET", "/api/reviews/product/:productId", catalog.getReviewsByProduct],
  ["POST", "/api/reviews", optionalAuth(catalog.createReview)],
  ["GET", "/api/admin/dashboard", requireAdmin(admin.getDashboardStats)],
  ["GET", "/api/admin/orders", requireAdmin(admin.getAllOrders)],
  ["PUT", "/api/admin/orders/:id/status", requireAdmin(admin.updateOrderStatus)],
  ["POST", "/api/admin/products", requireAdmin(admin.createProduct)],
  ["PUT", "/api/admin/products/:id", requireAdmin(admin.updateProduct)],
  ["DELETE", "/api/admin/products/:id", requireAdmin(admin.deleteProduct)],
  ["POST", "/api/admin/coupons", requireAdmin(admin.createCoupon)],
  ["POST", "/api/uploads", uploadPhoto],
  ["POST", "/api/uploads/multiple", uploadPhotos],
];

function match(pattern: string, path: string) {
  const p = pattern.split("/"), s = path.replace(/\/$/, "").split("/");
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export default async (req: Request) => {
  const url = new URL(req.url);
  try {
    // Serve uploaded photos from Blobs
    if (url.pathname.startsWith("/uploads/")) {
      const key = decodeURIComponent(url.pathname.slice("/uploads/".length));
      const entry = await uploadsStore().getWithMetadata(key, { type: "arrayBuffer" });
      if (!entry) return new Response("Not found", { status: 404 });
      return new Response(entry.data, {
        headers: { "Content-Type": String(entry.metadata?.contentType || "application/octet-stream"), "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
    for (const [method, pattern, handler] of routes) {
      if (method !== req.method) continue;
      const params = match(pattern, url.pathname);
      if (!params) continue;
      const isJson = req.headers.get("content-type")?.includes("application/json");
      const body = isJson ? await req.json().catch(() => ({})) : {};
      return await handler({ req, url, params, query: url.searchParams, body });
    }
    return json({ error: `API route not found: ${req.method} ${url.pathname}` }, 404);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("[API Error]:", err);
    return json({ error: "An unexpected internal server error occurred." }, 500);
  }
};

export const config: Config = { path: ["/api/*", "/uploads/*"] };
