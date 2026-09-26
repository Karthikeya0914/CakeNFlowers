const prisma = require('../utils/prisma');

async function getProducts(req, res, next) {
  try {
    const { category, type, occasion, isEggless, minPrice, maxPrice, search, sort, limit, page } = req.query;

    const where = { active: true };

    if (category) {
      where.category = { slug: category };
    }

    if (type) {
      where.category = { ...where.category, type: type.toUpperCase() };
    }

    if (occasion) {
      where.occasionTags = { contains: occasion.toLowerCase() };
    }

    if (isEggless === 'true') {
      where.isEggless = true;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { occasionTags: { contains: q } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
    if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
    if (sort === 'rating') orderBy = { ratingAvg: 'desc' };
    if (sort === 'popular') orderBy = { reviewsCount: 'desc' };

    const take = limit ? parseInt(limit) : 50;
    const skip = page ? (parseInt(page) - 1) * take : 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, type: true } },
          variants: true
        },
        orderBy,
        take,
        skip
      }),
      prisma.product.count({ where })
    ]);

    // Parse image JSON strings into arrays for frontend convenience
    const formatted = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
    }));

    res.json({
      products: formatted,
      total,
      page: page ? parseInt(page) : 1,
      totalPages: Math.ceil(total / take)
    });
  } catch (err) {
    next(err);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          orderBy: { priceModifier: 'asc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const formatted = {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images || '[]') : product.images
    };

    res.json({ product: formatted });
  } catch (err) {
    next(err);
  }
}

async function getFeaturedProducts(req, res, next) {
  try {
    const bestsellers = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: { select: { name: true, slug: true } },
        variants: true
      },
      orderBy: { ratingAvg: 'desc' },
      take: 8
    });

    const formatted = bestsellers.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
    }));

    res.json({ bestsellers: formatted });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getFeaturedProducts
};
