type CheckoutItem = { productName: string; variantName: string | null; customFlavor: string | null; priceAtPurchase: number; quantity: number };

export async function createCheckoutSession({
  orderNumber,
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderNumber: string;
  items: CheckoutItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string | null }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("mock")) {
    // Return simulated session for testing
    const id = `cs_test_simulated_${Date.now()}`;
    return { id, url: `${successUrl}?orderNumber=${orderNumber}&session_id=${id}` };
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      price_data: {
        currency: (process.env.CURRENCY || "USD").toLowerCase(),
        product_data: {
          name: item.productName || "Boutique Item",
          description: [item.variantName, item.customFlavor].filter(Boolean).join(" • ") || undefined,
        },
        unit_amount: Math.round(item.priceAtPurchase * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    customer_email: customerEmail || undefined,
    client_reference_id: orderNumber,
    success_url: `${successUrl}?orderNumber=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });
}
