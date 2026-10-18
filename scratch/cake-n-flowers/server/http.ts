import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type AuthUser = { id: string; name: string; email: string; role: string; phone: string | null };

export type Ctx = {
  req: Request;
  url: URL;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  user?: AuthUser;
};

export type Handler = (ctx: Ctx) => Promise<Response>;

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_cake_n_flowers_jwt_key_2026";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export const parseImages = (images: unknown) =>
  typeof images === "string" ? JSON.parse(images || "[]") : images;

export function parseJsonOr<T>(value: string, fallback: T) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function loadUserFromToken(req: Request): Promise<AuthUser | undefined> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return undefined;
  const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET) as { userId: string };
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone })
    .from(users)
    .where(eq(users.id, decoded.userId));
  return user;
}

// Protect routes for logged-in users
export const requireAuth =
  (handler: Handler): Handler =>
  async (ctx) => {
    if (!ctx.req.headers.get("authorization")?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required. Please log in.");
    }
    let user: AuthUser | undefined;
    try {
      user = await loadUserFromToken(ctx.req);
    } catch {
      throw new HttpError(401, "Invalid or expired authentication token.");
    }
    if (!user) throw new HttpError(401, "User account no longer exists.");
    return handler({ ...ctx, user });
  };

// Optional auth: loads user if valid token exists, otherwise leaves ctx.user undefined
export const optionalAuth =
  (handler: Handler): Handler =>
  async (ctx) => {
    let user: AuthUser | undefined;
    try {
      user = await loadUserFromToken(ctx.req);
    } catch {
      // Ignore invalid token in optional auth
    }
    return handler({ ...ctx, user });
  };

// Admin-only role check
export const requireAdmin = (handler: Handler): Handler =>
  requireAuth(async (ctx) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new HttpError(403, "Access denied. Administrator privileges required.");
    }
    return handler(ctx);
  });
