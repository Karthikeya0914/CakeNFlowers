import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { addresses, users } from "../db/schema.js";
import { HttpError, json, JWT_EXPIRES_IN, JWT_SECRET, type Ctx } from "./http.js";

function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

// POST /api/auth/register
export async function register({ body }: Ctx) {
  const { name, email, password, phone } = body;
  if (!name || !email || !password) throw new HttpError(400, "Name, email, and password are required.");

  const normalizedEmail = String(email).toLowerCase().trim();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
  if (existing) throw new HttpError(400, "An account with this email already exists.");

  const [user] = await db
    .insert(users)
    .values({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      phone: phone ? String(phone).trim() : null,
      role: "CUSTOMER",
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      createdAt: users.createdAt,
    });

  return json({ message: "Account created successfully.", user, token: generateToken(user) }, 201);
}

// POST /api/auth/login
export async function login({ body }: Ctx) {
  const { email, password } = body;
  if (!email || !password) throw new HttpError(400, "Email and password are required.");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, String(email).toLowerCase().trim()));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password.");
  }

  return json({
    message: "Login successful.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    token: generateToken(user),
  });
}

// GET /api/auth/me
export async function getMe({ user }: Ctx) {
  const [profile] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user!.id));
  const userAddresses = await db.select().from(addresses).where(eq(addresses.userId, user!.id));
  return json({ user: { ...profile, addresses: userAddresses } });
}

// POST /api/auth/addresses
export async function addAddress({ body, user }: Ctx) {
  const { label, recipientName, street, landmark, city, state, zip, phone, isDefault } = body;
  if (!recipientName || !street || !city || !state || !zip || !phone) {
    throw new HttpError(400, "All address fields (recipient, street, city, state, zip, phone) are required.");
  }

  if (isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user!.id));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      userId: user!.id,
      label: label || "Home",
      recipientName,
      street,
      landmark: landmark || null,
      city,
      state,
      zip,
      phone,
      isDefault: Boolean(isDefault),
    })
    .returning();

  return json({ address }, 201);
}

// DELETE /api/auth/addresses/:id
export async function deleteAddress({ params, user }: Ctx) {
  await db.delete(addresses).where(and(eq(addresses.id, params.id), eq(addresses.userId, user!.id)));
  return json({ message: "Address removed." });
}
