let stripe = null;

try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
  }
} catch (e) {
  console.log('[Stripe] Running in mock/simulation mode.');
}

async function createCheckoutSession({ orderNumber, items, total, customerEmail, successUrl, cancelUrl }) {
  if (!stripe) {
    // Return simulated session for testing
    return {
      id: `cs_test_simulated_${Date.now()}`,
      url: `${successUrl}?orderNumber=${orderNumber}&session_id=cs_test_simulated_${Date.now()}`,
      mode: 'simulation'
    };
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: (process.env.CURRENCY || 'USD').toLowerCase(),
      product_data: {
        name: item.productName || 'Boutique Item',
        description: [item.variantName, item.customFlavor].filter(Boolean).join(' • ') || undefined
      },
      unit_amount: Math.round(item.priceAtPurchase * 100)
    },
    quantity: item.quantity
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: customerEmail || undefined,
    client_reference_id: orderNumber,
    success_url: `${successUrl}?orderNumber=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl
  });

  return session;
}

module.exports = {
  stripe,
  createCheckoutSession
};
