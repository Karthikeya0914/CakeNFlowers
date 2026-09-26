const prisma = require('../utils/prisma');

// GET /api/admin/dashboard
async function getDashboardStats(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      orders,
      recentOrders,
      lowStockProducts,
      categoriesCount,
      customersCount
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: { select: { name: true } } }
          }
        }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 15 } },
        select: { id: true, name: true, stock: true, basePrice: true }
      }),
      prisma.category.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today).length;
    const activeDeliveries = orders.filter((o) =>
      ['CONFIRMED', 'PREPARING', 'QUALITY_PASSED', 'OUT_FOR_DELIVERY'].includes(o.status)
    ).length;

    res.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        todayOrders,
        activeDeliveries,
        lowStockCount: lowStockProducts.length,
        categoriesCount,
        customersCount
      },
      recentOrders,
      lowStockProducts
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/orders
async function getAllOrders(req, res, next) {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { recipientName: { contains: q } },
        { guestEmail: { contains: q } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/orders/:id/status
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber, notes, paymentStatus } = req.body;

    const data = {};
    if (status) data.status = status;
    if (courierName !== undefined) data.courierName = courierName;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (notes !== undefined) data.notes = notes;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { items: true }
    });

    res.json({ message: 'Order status updated successfully.', order: updated });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products
async function createProduct(req, res, next) {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      images,
      isCustomizable,
      hasPhotoUpload,
      isEggless,
      stock,
      occasionTags,
      variants
    } = req.body;

    if (!name || !description || !basePrice || !categoryId) {
      return res.status(400).json({ error: 'Name, description, basePrice, and categoryId are required.' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        basePrice: parseFloat(basePrice),
        categoryId,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        isCustomizable: Boolean(isCustomizable),
        hasPhotoUpload: Boolean(hasPhotoUpload),
        isEggless: Boolean(isEggless),
        stock: parseInt(stock) || 50,
        occasionTags: occasionTags || '',
        variants: variants && variants.length ? {
          create: variants.map((v) => ({
            name: v.name,
            priceModifier: parseFloat(v.priceModifier) || 0.0,
            isDefault: Boolean(v.isDefault)
          }))
        } : undefined
      },
      include: { variants: true, category: true }
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/products/:id
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      basePrice,
      categoryId,
      images,
      isCustomizable,
      hasPhotoUpload,
      isEggless,
      stock,
      active,
      occasionTags
    } = req.body;

    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (basePrice !== undefined) data.basePrice = parseFloat(basePrice);
    if (categoryId) data.categoryId = categoryId;
    if (images !== undefined) {
      data.images = typeof images === 'string' ? images : JSON.stringify(images);
    }
    if (isCustomizable !== undefined) data.isCustomizable = Boolean(isCustomizable);
    if (hasPhotoUpload !== undefined) data.hasPhotoUpload = Boolean(hasPhotoUpload);
    if (isEggless !== undefined) data.isEggless = Boolean(isEggless);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (active !== undefined) data.active = Boolean(active);
    if (occasionTags !== undefined) data.occasionTags = occasionTags;

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { variants: true, category: true }
    });

    res.json({ message: 'Product updated successfully.', product: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/products/:id
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/coupons
async function createCoupon(req, res, next) {
  try {
    const { code, discountType, discountValue, minOrderAmount, validTo } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discountType, and discountValue are required.' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0.0,
        validTo: validTo ? new Date(validTo) : null
      }
    });

    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createCoupon
};
