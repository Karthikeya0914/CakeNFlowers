const prisma = require('../utils/prisma');

async function getReviewsByProduct(req, res, next) {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { productId, rating, comment, userName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, and review comment are required.' });
    }

    const name = req.user ? req.user.name : userName || 'Verified Guest';
    const userId = req.user ? req.user.id : null;

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        userName: name,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment: comment.trim()
      }
    });

    // Recalculate product rating average
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAvg = Math.round((totalStars / allReviews.length) * 10) / 10;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg,
        reviewsCount: allReviews.length
      }
    });

    res.status(201).json({ review, ratingAvg, reviewsCount: allReviews.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReviewsByProduct,
  createReview
};
