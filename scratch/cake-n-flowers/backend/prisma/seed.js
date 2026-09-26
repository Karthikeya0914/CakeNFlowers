const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Cake N Flowers Boutique Database ---');

  // Clear existing
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Eleanor Vance',
      email: 'admin@cakenflowers.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+1 (555) 234-5678'
    }
  });

  const customerPassword = await bcrypt.hash('Customer123!', 10);
  const customer = await prisma.user.create({
    data: {
      name: 'Olivia Sterling',
      email: 'olivia@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+1 (555) 987-6543',
      addresses: {
        create: [
          {
            label: 'Home',
            recipientName: 'Olivia Sterling',
            street: '742 Evergreen Terrace, Apt 4B',
            landmark: 'Near Rosewood Park',
            city: 'Manhattan',
            state: 'NY',
            zip: '10001',
            phone: '+1 (555) 987-6543',
            isDefault: true
          }
        ]
      }
    }
  });

  console.log('Created admin and customer users.');

  // 2. Categories
  const catCakes = await prisma.category.create({
    data: {
      name: 'Artisanal Cakes',
      slug: 'cakes',
      type: 'CAKE',
      description: 'Handcrafted pastries layered with Belgian chocolates, Madagascar vanilla, and organic seasonal berries.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'
    }
  });

  const catFlowers = await prisma.category.create({
    data: {
      name: 'Bespoke Florals',
      slug: 'flowers',
      type: 'FLOWER',
      description: 'Fresh farm-cut Dutch roses, garden hydrangeas, French peonies, and fragrant lilies arranged by master florists.',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80'
    }
  });

  const catCombos = await prisma.category.create({
    data: {
      name: 'Luxury Combos',
      slug: 'combos',
      type: 'COMBO',
      description: 'Harmonious pairings of fresh bouquets, couture cakes, and handwritten botanical cards for unforgettable moments.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'
    }
  });

  const catGifts = await prisma.category.create({
    data: {
      name: 'Curated Gifts & Add-ons',
      slug: 'gifts',
      type: 'GIFT',
      description: 'Hand-poured aromatic candles, Parisian macarons, crystal toppers, and celebratory keepsakes.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80'
    }
  });

  console.log('Created categories.');

  // 3. Products
  const products = [
    // Cakes
    {
      name: 'Belgian Noir Truffle Cake',
      slug: 'belgian-noir-truffle-cake',
      description: 'Layers of tender chocolate sponge infused with single-origin Callebaut 70% dark ganache and dusted with Dutch cocoa velvet.',
      basePrice: 48.0,
      categoryId: catCakes.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: true,
      stock: 40,
      ratingAvg: 4.95,
      reviewsCount: 38,
      occasionTags: 'birthday,anniversary,luxury,romance',
      variants: [
        { name: '500g (Serves 4-6)', priceModifier: 0.0, isDefault: true },
        { name: '1.0 kg (Serves 8-10)', priceModifier: 24.0, isDefault: false },
        { name: '1.5 kg (Serves 12-16)', priceModifier: 42.0, isDefault: false }
      ]
    },
    {
      name: 'Rosewater & Wild Raspberry Opera',
      slug: 'rosewater-wild-raspberry-opera',
      description: 'An ethereal French opera cake featuring almond sponge, organic rosewater buttercream, fresh raspberry gelee, and edible gold leaf.',
      basePrice: 54.0,
      categoryId: catCakes.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 25,
      ratingAvg: 4.9,
      reviewsCount: 22,
      occasionTags: 'anniversary,romance,birthday',
      variants: [
        { name: '500g (Boutique Tier)', priceModifier: 0.0, isDefault: true },
        { name: '1.0 kg (Grand Tier)', priceModifier: 28.0, isDefault: false }
      ]
    },
    {
      name: 'Vintage Victorian Vanilla Bean Cake',
      slug: 'vintage-victorian-vanilla-bean-cake',
      description: 'Whipped Tahitian vanilla bean chantilly, heritage strawberry compote, and delicate vintage lambeth piping.',
      basePrice: 45.0,
      categoryId: catCakes.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: true,
      isEggless: true,
      stock: 30,
      ratingAvg: 4.88,
      reviewsCount: 19,
      occasionTags: 'birthday,congratulations,wedding',
      variants: [
        { name: '500g', priceModifier: 0.0, isDefault: true },
        { name: '1.0 kg', priceModifier: 22.0, isDefault: false },
        { name: '2.0 kg (Two Tier Celebration)', priceModifier: 55.0, isDefault: false }
      ]
    },
    {
      name: 'San Sebastian Basque Burnt Cheesecake',
      slug: 'san-sebastian-basque-burnt-cheesecake',
      description: 'Caramelized to dark mahogany perfection on the outside with a custardy, melt-in-mouth creamy molten center.',
      basePrice: 52.0,
      categoryId: catCakes.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: false,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 18,
      ratingAvg: 4.97,
      reviewsCount: 45,
      occasionTags: 'luxury,birthday,anniversary',
      variants: [
        { name: '750g (Serves 6-8)', priceModifier: 0.0, isDefault: true },
        { name: '1.5 kg (Serves 12-14)', priceModifier: 32.0, isDefault: false }
      ]
    },

    // Flowers
    {
      name: '50 Crimson Velvet Ecuadorian Roses',
      slug: '50-crimson-velvet-ecuadorian-roses',
      description: 'Hand-tied long-stem Ecuadorian deep crimson roses enveloped in textured matte paper and bound with sage satin ribbon.',
      basePrice: 65.0,
      categoryId: catFlowers.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 60,
      ratingAvg: 4.98,
      reviewsCount: 52,
      occasionTags: 'romance,anniversary,luxury',
      variants: [
        { name: 'Classic (24 Stems)', priceModifier: 0.0, isDefault: false },
        { name: 'Grandeur (50 Stems)', priceModifier: 35.0, isDefault: true },
        { name: 'Imperial (100 Stems)', priceModifier: 95.0, isDefault: false }
      ]
    },
    {
      name: 'Pastel Garden Symphony',
      slug: 'pastel-garden-symphony',
      description: 'A romantic cloud of Dutch blush hydrangeas, apricot garden roses, lilac sweet peas, and frosted spiral eucalyptus.',
      basePrice: 58.0,
      categoryId: catFlowers.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 35,
      ratingAvg: 4.92,
      reviewsCount: 31,
      occasionTags: 'birthday,congratulations,wedding,sympathy',
      variants: [
        { name: 'Deluxe Stem Bouquet', priceModifier: 0.0, isDefault: true },
        { name: 'Presented in Ceramic Artisan Vase', priceModifier: 22.0, isDefault: false }
      ]
    },
    {
      name: 'Casablanca White Lilies & Moon Orchids',
      slug: 'casablanca-white-lilies-moon-orchids',
      description: 'Intensely fragrant royal white oriental lilies accented with pristine Phalaenopsis orchids and olive leaves.',
      basePrice: 62.0,
      categoryId: catFlowers.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 20,
      ratingAvg: 4.91,
      reviewsCount: 16,
      occasionTags: 'sympathy,congratulations,luxury',
      variants: [
        { name: 'Standard Botanical Wrap', priceModifier: 0.0, isDefault: true },
        { name: 'Fluted Glass Cylinder Vase', priceModifier: 18.0, isDefault: false }
      ]
    },

    // Combos
    {
      name: 'The Royal Sovereign: Truffle Cake & Velvet Roses',
      slug: 'the-royal-sovereign-combo',
      description: 'Our signature Belgian Noir Truffle Cake accompanied by 24 Crimson Roses and a gold foil letterpressed message card.',
      basePrice: 89.0,
      categoryId: catCombos.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: true,
      stock: 25,
      ratingAvg: 4.99,
      reviewsCount: 64,
      occasionTags: 'anniversary,romance,birthday,luxury',
      variants: [
        { name: 'Standard (500g Cake + 24 Roses)', priceModifier: 0.0, isDefault: true },
        { name: 'Grand (1kg Cake + 50 Roses)', priceModifier: 48.0, isDefault: false }
      ]
    },
    {
      name: 'The Parisian Dawn Celebration Hamper',
      slug: 'the-parisian-dawn-celebration-hamper',
      description: 'Pastel Garden Symphony bouquet, box of 12 French macarons, a hand-poured soy candle, and vintage celebration sparklers.',
      basePrice: 98.0,
      categoryId: catCombos.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: true,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 15,
      ratingAvg: 4.96,
      reviewsCount: 29,
      occasionTags: 'birthday,luxury,congratulations',
      variants: [
        { name: 'Bespoke Curated Box', priceModifier: 0.0, isDefault: true }
      ]
    },

    // Gifts
    {
      name: 'Artisan Parisian Macaron Collection (12 pcs)',
      slug: 'artisan-parisian-macaron-collection',
      description: 'Pistachio, Salted Butter Caramel, Rose Petal, Cassis, Dark Chocolate, and Madagascar Vanilla.',
      basePrice: 28.0,
      categoryId: catGifts.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: false,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 50,
      ratingAvg: 4.87,
      reviewsCount: 14,
      occasionTags: 'birthday,anniversary,gifts',
      variants: [
        { name: 'Pastel Gift Box (12 pcs)', priceModifier: 0.0, isDefault: true },
        { name: 'Grand Box (24 pcs)', priceModifier: 24.0, isDefault: false }
      ]
    },
    {
      name: 'Golden Amber & Damask Rose Soy Candle',
      slug: 'golden-amber-damask-rose-soy-candle',
      description: 'Hand-poured 100% natural soy wax candle in matte amber glass with notes of Bulgarian rose, warm amber, and pink peppercorn.',
      basePrice: 24.0,
      categoryId: catGifts.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80'
      ]),
      isCustomizable: false,
      hasPhotoUpload: false,
      isEggless: false,
      stock: 60,
      ratingAvg: 4.94,
      reviewsCount: 18,
      occasionTags: 'gifts,anniversary,romance',
      variants: [
        { name: '280g (60h Burn Time)', priceModifier: 0.0, isDefault: true }
      ]
    }
  ];

  for (const p of products) {
    const { variants, ...prodData } = p;
    const createdProduct = await prisma.product.create({
      data: prodData
    });

    if (variants && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            name: v.name,
            priceModifier: v.priceModifier,
            isDefault: v.isDefault
          }
        });
      }
    }

    // Seed a couple of verified reviews
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userId: customer.id,
        userName: 'Olivia Sterling',
        rating: 5,
        comment: 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'
      }
    });
  }

  console.log(`Created ${products.length} boutique products with variants and reviews.`);

  // 4. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10.0,
        minOrderAmount: 40.0,
        active: true
      },
      {
        code: 'LUXURY20',
        discountType: 'PERCENTAGE',
        discountValue: 20.0,
        minOrderAmount: 80.0,
        active: true
      },
      {
        code: 'SWEET5',
        discountType: 'FIXED',
        discountValue: 5.0,
        minOrderAmount: 30.0,
        active: true
      }
    ]
  });

  console.log('Created promotional coupons.');

  // 5. Create a sample completed order and an active order for testing tracking
  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'belgian-noir-truffle-cake' },
    include: { variants: true }
  });

  await prisma.order.create({
    data: {
      orderNumber: 'CNF-2026-8941',
      userId: customer.id,
      guestEmail: 'olivia@example.com',
      guestName: 'Olivia Sterling',
      guestPhone: '+1 (555) 987-6543',
      status: 'OUT_FOR_DELIVERY',
      subtotal: 72.0,
      deliveryFee: 5.0,
      discount: 7.2,
      total: 69.8,
      deliveryDate: new Date().toISOString().split('T')[0],
      deliverySlot: 'Evening (6:00 PM - 9:00 PM)',
      deliveryInstructions: 'Ring doorbell twice. Fragile packaging.',
      recipientName: 'Claire Beauchamp',
      recipientPhone: '+1 (555) 345-6789',
      shippingAddress: JSON.stringify({
        street: '450 Lexington Ave, Suite 1200',
        city: 'New York',
        state: 'NY',
        zip: '10017'
      }),
      paymentStatus: 'PAID',
      paymentMethod: 'STRIPE',
      courierName: 'Boutique Chilled Courier Express',
      trackingNumber: 'TRK-98214-NY',
      items: {
        create: [
          {
            productId: sampleProduct.id,
            variantId: sampleProduct.variants[1]?.id,
            variantName: '1.0 kg (Serves 8-10)',
            quantity: 1,
            customFlavor: 'Belgian Noir Dark Truffle',
            customInscription: 'Happy 30th Birthday Claire!',
            customMessageCard: 'Wishing you the sweetest year ahead! With all our love, Olivia & Marcus.',
            isEggless: true,
            priceAtPurchase: 72.0
          }
        ]
      }
    }
  });

  console.log('Created sample active order (CNF-2026-8941) for tracking demonstration.');
  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
