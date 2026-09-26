const prisma = require('../utils/prisma');

async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          include: { variants: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json({ category });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug
};
