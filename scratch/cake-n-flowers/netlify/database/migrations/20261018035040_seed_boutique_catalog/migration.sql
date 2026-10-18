-- Seed the boutique catalog, demo accounts, coupons and a sample tracked order
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "phone") VALUES
  ('6decbb6d-e816-4023-bfb3-2156a142447a', 'Eleanor Vance', 'admin@cakenflowers.com', '$2b$10$PDZGRS84bnXirlAug76tSe15hMZZw3G8Iomen9CScvTO9CX8ZKGPi', 'ADMIN', '+1 (555) 234-5678'),
  ('8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 'olivia@example.com', '$2b$10$3sywFjo7EcQPKsLtOjqkJuu/jTZpt6vOR1sDQn1X7onqeZJqQJgf.', 'CUSTOMER', '+1 (555) 987-6543')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "addresses" ("id", "user_id", "label", "recipient_name", "street", "landmark", "city", "state", "zip", "phone", "is_default") VALUES
  ('b96711e7-0b83-4847-b18f-f05b4b4cd74a', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Home', 'Olivia Sterling', '742 Evergreen Terrace, Apt 4B', 'Near Rosewood Park', 'Manhattan', 'NY', '10001', '+1 (555) 987-6543', TRUE)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "categories" ("id", "name", "slug", "type", "description", "image") VALUES
  ('322d6a80-d145-47e2-85c9-418a593c84c2', 'Artisanal Cakes', 'cakes', 'CAKE', 'Handcrafted pastries layered with Belgian chocolates, Madagascar vanilla, and organic seasonal berries.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'),
  ('c4aea458-3554-4f1c-a788-aa0b7288a5ff', 'Bespoke Florals', 'flowers', 'FLOWER', 'Fresh farm-cut Dutch roses, garden hydrangeas, French peonies, and fragrant lilies arranged by master florists.', 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80'),
  ('e9562aea-c507-4ff5-8083-b062b845b670', 'Luxury Combos', 'combos', 'COMBO', 'Harmonious pairings of fresh bouquets, couture cakes, and handwritten botanical cards for unforgettable moments.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'),
  ('e0cced93-ac5a-4a5a-8d7c-def6796df328', 'Curated Gifts & Add-ons', 'gifts', 'GIFT', 'Hand-poured aromatic candles, Parisian macarons, crystal toppers, and celebratory keepsakes.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "products" ("id", "name", "slug", "description", "base_price", "category_id", "images", "is_customizable", "has_photo_upload", "is_eggless", "stock", "rating_avg", "reviews_count", "occasion_tags") VALUES
  ('a3dd00b4-60d9-48a1-80ae-d2dff7703d39', 'Belgian Noir Truffle Cake', 'belgian-noir-truffle-cake', 'Layers of tender chocolate sponge infused with single-origin Callebaut 70% dark ganache and dusted with Dutch cocoa velvet.', 48, '322d6a80-d145-47e2-85c9-418a593c84c2', '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, TRUE, 40, 4.95, 38, 'birthday,anniversary,luxury,romance'),
  ('3b6f7244-7814-454f-b8c7-f01fdeb9c139', 'Rosewater & Wild Raspberry Opera', 'rosewater-wild-raspberry-opera', 'An ethereal French opera cake featuring almond sponge, organic rosewater buttercream, fresh raspberry gelee, and edible gold leaf.', 54, '322d6a80-d145-47e2-85c9-418a593c84c2', '["https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, FALSE, 25, 4.9, 22, 'anniversary,romance,birthday'),
  ('1e993138-dd9f-4df7-a122-55a5ceb1a297', 'Vintage Victorian Vanilla Bean Cake', 'vintage-victorian-vanilla-bean-cake', 'Whipped Tahitian vanilla bean chantilly, heritage strawberry compote, and delicate vintage lambeth piping.', 45, '322d6a80-d145-47e2-85c9-418a593c84c2', '["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80"]', TRUE, TRUE, TRUE, 30, 4.88, 19, 'birthday,congratulations,wedding'),
  ('8ce0d65b-f1de-471d-a09b-e155c1e38753', 'San Sebastian Basque Burnt Cheesecake', 'san-sebastian-basque-burnt-cheesecake', 'Caramelized to dark mahogany perfection on the outside with a custardy, melt-in-mouth creamy molten center.', 52, '322d6a80-d145-47e2-85c9-418a593c84c2', '["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80"]', FALSE, FALSE, FALSE, 18, 4.97, 45, 'luxury,birthday,anniversary'),
  ('d5513550-0877-4aa4-a8fb-eb9807f17442', '50 Crimson Velvet Ecuadorian Roses', '50-crimson-velvet-ecuadorian-roses', 'Hand-tied long-stem Ecuadorian deep crimson roses enveloped in textured matte paper and bound with sage satin ribbon.', 65, 'c4aea458-3554-4f1c-a788-aa0b7288a5ff', '["https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, FALSE, 60, 4.98, 52, 'romance,anniversary,luxury'),
  ('3c1fdaad-1062-4b23-ba58-b716c66a492b', 'Pastel Garden Symphony', 'pastel-garden-symphony', 'A romantic cloud of Dutch blush hydrangeas, apricot garden roses, lilac sweet peas, and frosted spiral eucalyptus.', 58, 'c4aea458-3554-4f1c-a788-aa0b7288a5ff', '["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, FALSE, 35, 4.92, 31, 'birthday,congratulations,wedding,sympathy'),
  ('cecf761c-e4c8-44c8-8e1f-6d1750502221', 'Casablanca White Lilies & Moon Orchids', 'casablanca-white-lilies-moon-orchids', 'Intensely fragrant royal white oriental lilies accented with pristine Phalaenopsis orchids and olive leaves.', 62, 'c4aea458-3554-4f1c-a788-aa0b7288a5ff', '["https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, FALSE, 20, 4.91, 16, 'sympathy,congratulations,luxury'),
  ('133082b5-1ef3-4f3b-a77e-72f0e62b8a23', 'The Royal Sovereign: Truffle Cake & Velvet Roses', 'the-royal-sovereign-combo', 'Our signature Belgian Noir Truffle Cake accompanied by 24 Crimson Roses and a gold foil letterpressed message card.', 89, 'e9562aea-c507-4ff5-8083-b062b845b670', '["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, TRUE, 25, 4.99, 64, 'anniversary,romance,birthday,luxury'),
  ('2ad37720-025f-4281-9b03-5af1e9fefb9b', 'The Parisian Dawn Celebration Hamper', 'the-parisian-dawn-celebration-hamper', 'Pastel Garden Symphony bouquet, box of 12 French macarons, a hand-poured soy candle, and vintage celebration sparklers.', 98, 'e9562aea-c507-4ff5-8083-b062b845b670', '["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80"]', TRUE, FALSE, FALSE, 15, 4.96, 29, 'birthday,luxury,congratulations'),
  ('4fe41cb3-a3ba-471e-b379-d44c4c487c4b', 'Artisan Parisian Macaron Collection (12 pcs)', 'artisan-parisian-macaron-collection', 'Pistachio, Salted Butter Caramel, Rose Petal, Cassis, Dark Chocolate, and Madagascar Vanilla.', 28, 'e0cced93-ac5a-4a5a-8d7c-def6796df328', '["https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=80"]', FALSE, FALSE, FALSE, 50, 4.87, 14, 'birthday,anniversary,gifts'),
  ('bc85fb69-36e6-4e21-9c44-c57e17e6ab71', 'Golden Amber & Damask Rose Soy Candle', 'golden-amber-damask-rose-soy-candle', 'Hand-poured 100% natural soy wax candle in matte amber glass with notes of Bulgarian rose, warm amber, and pink peppercorn.', 24, 'e0cced93-ac5a-4a5a-8d7c-def6796df328', '["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"]', FALSE, FALSE, FALSE, 60, 4.94, 18, 'gifts,anniversary,romance')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_variants" ("id", "product_id", "name", "price_modifier", "is_default") VALUES
  ('fbb012cc-019b-4efc-b739-7c2986623435', 'a3dd00b4-60d9-48a1-80ae-d2dff7703d39', '500g (Serves 4-6)', 0, TRUE),
  ('66600be1-3b37-409b-ae41-ba107b469b14', 'a3dd00b4-60d9-48a1-80ae-d2dff7703d39', '1.0 kg (Serves 8-10)', 24, FALSE),
  ('830440df-a027-40e9-b0d7-e376f0ef3434', 'a3dd00b4-60d9-48a1-80ae-d2dff7703d39', '1.5 kg (Serves 12-16)', 42, FALSE),
  ('be31c9a6-f9b1-4405-bb6a-e38d54dbf3db', '3b6f7244-7814-454f-b8c7-f01fdeb9c139', '500g (Boutique Tier)', 0, TRUE),
  ('066d6186-a348-4504-a6d3-7cc227419507', '3b6f7244-7814-454f-b8c7-f01fdeb9c139', '1.0 kg (Grand Tier)', 28, FALSE),
  ('985af729-8d98-4d1e-b74b-1f26f45bfb5b', '1e993138-dd9f-4df7-a122-55a5ceb1a297', '500g', 0, TRUE),
  ('8e91f131-881f-44fa-8c0b-09370d3bff4a', '1e993138-dd9f-4df7-a122-55a5ceb1a297', '1.0 kg', 22, FALSE),
  ('4abb40e4-d705-4a35-acff-fed3e3e130c7', '1e993138-dd9f-4df7-a122-55a5ceb1a297', '2.0 kg (Two Tier Celebration)', 55, FALSE),
  ('0482e38f-9a8c-4694-af25-61ffb70eba60', '8ce0d65b-f1de-471d-a09b-e155c1e38753', '750g (Serves 6-8)', 0, TRUE),
  ('24a0d8f6-dd6f-47cc-a4ae-42b94675418b', '8ce0d65b-f1de-471d-a09b-e155c1e38753', '1.5 kg (Serves 12-14)', 32, FALSE),
  ('d85b73a8-2920-4bce-9171-88e80e106ee3', 'd5513550-0877-4aa4-a8fb-eb9807f17442', 'Classic (24 Stems)', 0, FALSE),
  ('e8a58f21-5908-4440-a398-2043f68be02e', 'd5513550-0877-4aa4-a8fb-eb9807f17442', 'Grandeur (50 Stems)', 35, TRUE),
  ('4e1f3d7b-1934-4a70-b3ad-96eacf7e5c4d', 'd5513550-0877-4aa4-a8fb-eb9807f17442', 'Imperial (100 Stems)', 95, FALSE),
  ('8f1689d4-fd8f-4102-919c-441399e40c48', '3c1fdaad-1062-4b23-ba58-b716c66a492b', 'Deluxe Stem Bouquet', 0, TRUE),
  ('85874150-e5a2-45e5-ba4f-1856bcc156b3', '3c1fdaad-1062-4b23-ba58-b716c66a492b', 'Presented in Ceramic Artisan Vase', 22, FALSE),
  ('8491bc3b-8042-4d56-a239-ebb42d7a4cfa', 'cecf761c-e4c8-44c8-8e1f-6d1750502221', 'Standard Botanical Wrap', 0, TRUE),
  ('5026d2ce-e92c-4497-a055-4ebd4e957d55', 'cecf761c-e4c8-44c8-8e1f-6d1750502221', 'Fluted Glass Cylinder Vase', 18, FALSE),
  ('c69d5586-3738-40a2-b97a-21d2dea56567', '133082b5-1ef3-4f3b-a77e-72f0e62b8a23', 'Standard (500g Cake + 24 Roses)', 0, TRUE),
  ('91780e06-0186-4cd3-beca-1285e9a98ad7', '133082b5-1ef3-4f3b-a77e-72f0e62b8a23', 'Grand (1kg Cake + 50 Roses)', 48, FALSE),
  ('92d4e0b9-e221-4d31-a6f6-5e7923fd9a61', '2ad37720-025f-4281-9b03-5af1e9fefb9b', 'Bespoke Curated Box', 0, TRUE),
  ('6812689c-2406-4606-a686-df8ab732a45f', '4fe41cb3-a3ba-471e-b379-d44c4c487c4b', 'Pastel Gift Box (12 pcs)', 0, TRUE),
  ('1106681c-0c9c-4ea9-86e0-01c0c4d01455', '4fe41cb3-a3ba-471e-b379-d44c4c487c4b', 'Grand Box (24 pcs)', 24, FALSE),
  ('238579c2-c2aa-402f-9b5e-5bb7ff11bd84', 'bc85fb69-36e6-4e21-9c44-c57e17e6ab71', '280g (60h Burn Time)', 0, TRUE)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "reviews" ("id", "product_id", "user_id", "user_name", "rating", "comment") VALUES
  ('23e435c9-9cab-4be2-9bef-e417b666211c', 'a3dd00b4-60d9-48a1-80ae-d2dff7703d39', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('0fc9fd19-719c-4f35-bff8-37cdb478eea2', '3b6f7244-7814-454f-b8c7-f01fdeb9c139', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('38a72d58-57f1-4d76-94d2-63f7758517bb', '1e993138-dd9f-4df7-a122-55a5ceb1a297', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('b0489afc-1244-47ac-9cb8-a3cf5fed180e', '8ce0d65b-f1de-471d-a09b-e155c1e38753', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('83d17491-85df-4560-9e4b-385c4085d868', 'd5513550-0877-4aa4-a8fb-eb9807f17442', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('03a2c0b6-33ee-4a81-a4c0-afbfeaf47f74', '3c1fdaad-1062-4b23-ba58-b716c66a492b', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('ac2f8055-042f-4dac-b514-4854163cd63e', 'cecf761c-e4c8-44c8-8e1f-6d1750502221', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('5b6ecf99-7404-49f2-b7e8-9b8fba9ea79a', '133082b5-1ef3-4f3b-a77e-72f0e62b8a23', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('b06e2420-cc41-4c1f-b511-e1fc9f72e6d6', '2ad37720-025f-4281-9b03-5af1e9fefb9b', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('fc7b5292-4be1-4cb9-9f69-5b95653831b1', '4fe41cb3-a3ba-471e-b379-d44c4c487c4b', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!'),
  ('a72aca14-b631-4db0-bf78-3a97d0d57a36', 'bc85fb69-36e6-4e21-9c44-c57e17e6ab71', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'Olivia Sterling', 5, 'Exquisite presentation and unmatched quality. Arrived right on schedule in perfect condition!')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "coupons" ("id", "code", "discount_type", "discount_value", "min_order_amount", "active") VALUES
  ('8281d344-246a-401a-99ed-856324ab4ca0', 'WELCOME10', 'PERCENTAGE', 10, 40, TRUE),
  ('45fc4cdc-98e5-4e84-af02-1ba2d4f681a1', 'LUXURY20', 'PERCENTAGE', 20, 80, TRUE),
  ('4fe9f343-f4aa-497e-baaa-c627714522ee', 'SWEET5', 'FIXED', 5, 30, TRUE)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "orders" ("id", "order_number", "user_id", "guest_email", "guest_name", "guest_phone", "status", "subtotal", "delivery_fee", "discount", "total", "delivery_date", "delivery_slot", "delivery_instructions", "recipient_name", "recipient_phone", "shipping_address", "payment_status", "payment_method", "courier_name", "tracking_number") VALUES
  ('eec3ab70-4114-49da-93fa-a92644d51a8a', 'CNF-2026-8941', '8183efba-5188-4aab-b1fd-f2027f192a1c', 'olivia@example.com', 'Olivia Sterling', '+1 (555) 987-6543', 'OUT_FOR_DELIVERY', 72, 5, 7.2, 69.8, '2026-10-18', 'Evening (6:00 PM - 9:00 PM)', 'Ring doorbell twice. Fragile packaging.', 'Claire Beauchamp', '+1 (555) 345-6789', '{"street":"450 Lexington Ave, Suite 1200","city":"New York","state":"NY","zip":"10017"}', 'PAID', 'STRIPE', 'Boutique Chilled Courier Express', 'TRK-98214-NY')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "order_items" ("id", "order_id", "product_id", "variant_id", "variant_name", "quantity", "custom_flavor", "custom_inscription", "custom_message_card", "is_eggless", "price_at_purchase") VALUES
  ('3ffc9ec5-dc70-4ce3-b3de-da57fef79b5e', 'eec3ab70-4114-49da-93fa-a92644d51a8a', 'a3dd00b4-60d9-48a1-80ae-d2dff7703d39', '66600be1-3b37-409b-ae41-ba107b469b14', '1.0 kg (Serves 8-10)', 1, 'Belgian Noir Dark Truffle', 'Happy 30th Birthday Claire!', 'Wishing you the sweetest year ahead! With all our love, Olivia & Marcus.', TRUE, 72)
ON CONFLICT DO NOTHING;
