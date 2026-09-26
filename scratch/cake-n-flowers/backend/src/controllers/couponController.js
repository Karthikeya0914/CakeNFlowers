const prisma = require('../utils/prisma');

async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Please enter a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon || !coupon.active) {
      return res.status(404).json({ error: 'Invalid or inactive promotional code.' });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return res.status(400).json({ error: 'This coupon is not yet active.' });
    }

    if (coupon.validTo && new Date(coupon.validTo) < now) {
      return res.status(400).json({ error: 'This coupon code has expired.' });
    }

    const orderAmount = parseFloat(subtotal) || 0;
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this code.`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    // Round to 2 decimals
    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCoupon
};
