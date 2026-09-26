const prisma = require('../utils/prisma');
const { createCheckoutSession } = require('../utils/stripe');

// Helper to compute delivery fee based on slot
function calculateDeliveryFee(slot, subtotal) {
  if (!slot) return 5.0;
  const lower = slot.toLowerCase();
  if (lower.includes('midnight')) return 12.0;
  if (lower.includes('express')) return 8.0;
  if (subtotal >= 70.0) return 0.0; // Free delivery for orders $70+
  return 5.0;
}

// Helper to generate unique human-readable order number
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `CNF-${year}-${randomPart}`;
}

// POST /api/orders
async function createOrder(req, res, next) {
  try {
    const {
      items,
      deliveryDate,
      deliverySlot,
      deliveryInstructions,
      recipientName,
      recipientPhone,
      shippingAddress,
      guestEmail,
      guestName,
      guestPhone,
      couponCode,
      paymentMethod = 'STRIPE'
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    if (!deliveryDate || !deliverySlot) {
      return res.status(400).json({ error: 'Please select a delivery date and preferred delivery time slot.' });
    }

    if (!recipientName || !recipientPhone || !shippingAddress) {
      return res.status(400).json({ error: 'Recipient name, phone, and delivery address are required.' });
    }

    // Identify user or guest
    const userId = req.user ? req.user.id : null;
    const finalGuestEmail = req.user ? req.user.email : guestEmail;
    const finalGuestName = req.user ? req.user.name : guestName || recipientName;
    const finalGuestPhone = req.user ? (req.user.phone || guestPhone) : guestPhone;

    if (!userId && !finalGuestEmail) {
      return res.status(400).json({ error: 'Please provide an email address for order notifications.' });
    }

    // Verify and compute prices from DB
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.active) {
        return res.status(400).json({ error: `Product not available: ${item.name || item.productId}` });
      }

      let price = product.basePrice;
      let variantName = null;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId }
        });
        if (variant) {
          price += variant.priceModifier;
          variantName = variant.name;
        }
      }

      const qty = parseInt(item.quantity) || 1;
      const itemTotal = price * qty;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        variantId: item.variantId || null,
        variantName: variantName || item.variantName || null,
        quantity: qty,
        customFlavor: item.customFlavor || null,
        customMessageCard: item.customMessageCard || null,
        customPhotoUrl: item.customPhotoUrl || null,
        customInscription: item.customInscription || null,
        isEggless: Boolean(item.isEggless),
        priceAtPurchase: price
      });
    }

    // Calculate delivery fee
    const deliveryFee = calculateDeliveryFee(deliverySlot, subtotal);

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() }
      });
      if (coupon && coupon.active && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        discount = Math.round(discount * 100) / 100;

        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        });
      }
    }

    const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;
    const orderNumber = generateOrderNumber();

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail: finalGuestEmail,
        guestName: finalGuestName,
        guestPhone: finalGuestPhone,
        status: paymentMethod === 'COD' ? 'CONFIRMED' : 'CONFIRMED',
        subtotal,
        deliveryFee,
        discount,
        total,
        deliveryDate,
        deliverySlot,
        deliveryInstructions: deliveryInstructions || null,
        recipientName,
        recipientPhone,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
        paymentMethod,
        items: {
          create: verifiedItems.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            variantName: it.variantName,
            quantity: it.quantity,
            customFlavor: it.customFlavor,
            customMessageCard: it.customMessageCard,
            customPhotoUrl: it.customPhotoUrl,
            customInscription: it.customInscription,
            isEggless: it.isEggless,
            priceAtPurchase: it.priceAtPurchase
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Handle Stripe Session if requested
    let checkoutUrl = null;
    let sessionId = null;

    if (paymentMethod === 'STRIPE') {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const session = await createCheckoutSession({
        orderNumber: order.orderNumber,
        items: verifiedItems,
        total,
        customerEmail: finalGuestEmail,
        successUrl: `${clientUrl}/order-confirmed`,
        cancelUrl: `${clientUrl}/checkout`
      });

      sessionId = session.id;
      checkoutUrl = session.url;

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: sessionId }
      });
    }

    res.status(201).json({
      message: 'Order created successfully.',
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      checkoutUrl,
      order
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/track/:orderNumber
async function getOrderTracking(req, res, next) {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your order number.' });
    }

    // Format address
    let parsedAddress = order.shippingAddress;
    try {
      parsedAddress = JSON.parse(order.shippingAddress);
    } catch (e) {}

    // Timeline stages
    const stages = [
      { id: 'CONFIRMED', label: 'Order Confirmed', description: 'Your order has been received and verified.' },
      { id: 'PREPARING', label: 'Artisan Preparation', description: 'Pastry chefs & master florists are handcrafting your order.' },
      { id: 'QUALITY_PASSED', label: 'Quality Inspected', description: 'Freshness and presentation approved.' },
      { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'In transit with temperature-controlled courier.' },
      { id: 'DELIVERED', label: 'Delivered', description: 'Hand-delivered to the recipient with care.' }
    ];

    const currentStageIndex = stages.findIndex((s) => s.id === order.status);

    const formattedOrder = {
      ...order,
      shippingAddress: parsedAddress,
      items: order.items.map((it) => ({
        ...it,
        product: {
          ...it.product,
          images: typeof it.product.images === 'string' ? JSON.parse(it.product.images || '[]') : it.product.images
        }
      })),
      stages,
      currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : 0
    };

    res.json({ order: formattedOrder });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/my-orders (Protected)
async function getMyOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map((o) => ({
      ...o,
      shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress || '{}') : o.shippingAddress,
      items: o.items.map((it) => ({
        ...it,
        product: {
          ...it.product,
          images: typeof it.product.images === 'string' ? JSON.parse(it.product.images || '[]') : it.product.images
        }
      }))
    }));

    res.json({ orders: formatted });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/confirm-payment
async function confirmPayment(req, res, next) {
  try {
    const { orderNumber, sessionId } = req.body;

    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    });

    res.json({ message: 'Payment confirmed successfully.', order: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrderTracking,
  getMyOrders,
  confirmPayment
};
