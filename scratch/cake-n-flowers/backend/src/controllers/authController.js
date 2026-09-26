const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cake_n_flowers_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'CUSTOMER'
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true }
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      user,
      token
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        addresses: true
      }
    });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/addresses
async function addAddress(req, res, next) {
  try {
    const { label, recipientName, street, landmark, city, state, zip, phone, isDefault } = req.body;

    if (!recipientName || !street || !city || !state || !zip || !phone) {
      return res.status(400).json({ error: 'All address fields (recipient, street, city, state, zip, phone) are required.' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: label || 'Home',
        recipientName,
        street,
        landmark,
        city,
        state,
        zip,
        phone,
        isDefault: Boolean(isDefault)
      }
    });

    return res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/auth/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.address.deleteMany({
      where: { id, userId: req.user.id }
    });
    return res.json({ message: 'Address removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  addAddress,
  deleteAddress
};
