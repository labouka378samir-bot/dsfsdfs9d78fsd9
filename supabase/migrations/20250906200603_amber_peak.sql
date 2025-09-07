/*
  # تحديث المنتجات بالبيانات الجديدة
  
  1. تحديث الأسعار والمدد
  2. إضافة variants للمنتجات متعددة الخيارات
  3. تحديث حالة المخزون
  4. تحديث نوع التسليم
  5. إضافة ملاحظات التفعيل
*/

-- تحديث Apple One
UPDATE products SET 
  price_dzd = 1200,
  duration_days = 90,
  fulfillment_type = 'auto',
  stock_quantity = 0
WHERE sku = 'APPLE-ONE-1M';

-- تحديث Google One
UPDATE products SET 
  price_dzd = 1800,
  duration_days = 365,
  fulfillment_type = 'manual',
  stock_quantity = 50
WHERE sku = 'GOOGLE-ONE-1M';

-- تحديث Apple Music
UPDATE products SET 
  price_dzd = 800,
  duration_days = 60,
  fulfillment_type = 'auto',
  stock_quantity = 100
WHERE sku = 'APPLE-MUSIC-1M';

-- تحديث Apple TV+
UPDATE products SET 
  price_dzd = 500,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 75
WHERE sku = 'APPLE-TV-1M';

-- تحديث Apple Arcade
UPDATE products SET 
  price_dzd = 600,
  duration_days = 90,
  fulfillment_type = 'auto',
  stock_quantity = 0
WHERE sku = 'APPLE-ARCADE-1M';

-- تحديث Apple Fitness+
UPDATE products SET 
  price_dzd = 500,
  duration_days = 90,
  fulfillment_type = 'auto',
  stock_quantity = 0
WHERE sku = 'APPLE-FITNESS-1M';

-- تحديث Surfshark VPN
UPDATE products SET 
  price_dzd = 2500,
  duration_days = 365,
  fulfillment_type = 'assisted',
  stock_quantity = 40
WHERE sku = 'SURFSHARK-1M';

-- تحديث ExpressVPN
UPDATE products SET 
  price_dzd = 1000,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 35
WHERE sku = 'EXPRESSVPN-1M';

-- تحديث HMA VPN
UPDATE products SET 
  price_dzd = 1000,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 45
WHERE sku = 'HMA-VPN-1M';

-- تحديث Prime Video
UPDATE products SET 
  price_dzd = 700,
  duration_days = 30,
  fulfillment_type = 'assisted',
  stock_quantity = 0,
  pricing_model = 'variants'
WHERE sku = 'PRIME-VIDEO-1M';

-- تحديث Netflix
UPDATE products SET 
  price_dzd = 900,
  duration_days = 30,
  fulfillment_type = 'assisted',
  stock_quantity = 0,
  pricing_model = 'variants'
WHERE sku = 'NETFLIX-1M';

-- تحديث Crunchyroll
UPDATE products SET 
  price_dzd = 600,
  duration_days = 30,
  fulfillment_type = 'assisted',
  stock_quantity = 0,
  pricing_model = 'variants'
WHERE sku = 'CRUNCHYROLL-1M';

-- تحديث IPTV
UPDATE products SET 
  price_dzd = 3200,
  duration_days = 90,
  fulfillment_type = 'assisted',
  stock_quantity = 25,
  pricing_model = 'variants'
WHERE sku = 'IPTV-1M';

-- تحديث TOD TV
UPDATE products SET 
  price_dzd = 900,
  duration_days = 30,
  fulfillment_type = 'assisted',
  stock_quantity = 30
WHERE sku = 'TOD-TV-1M';

-- تحديث ChatGPT Plus
UPDATE products SET 
  price_dzd = 1400,
  duration_days = 90,
  fulfillment_type = 'manual',
  stock_quantity = 100,
  pricing_model = 'variants'
WHERE sku = 'CHATGPT-PLUS-1M';

-- تحديث Perplexity Pro
UPDATE products SET 
  price_dzd = 1500,
  duration_days = 365,
  fulfillment_type = 'manual',
  stock_quantity = 80,
  pricing_model = 'variants'
WHERE sku = 'PERPLEXITY-PRO-1M';

-- تحديث Canva Pro
UPDATE products SET 
  price_dzd = 500,
  duration_days = 365,
  fulfillment_type = 'assisted',
  stock_quantity = 120
WHERE sku = 'CANVA-PRO-1M';

-- تحديث CapCut Pro
UPDATE products SET 
  price_dzd = 800,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 85
WHERE sku = 'CAPCUT-PRO-1M';

-- تحديث Snapchat+
UPDATE products SET 
  price_dzd = 600,
  duration_days = 30,
  fulfillment_type = 'manual',
  stock_quantity = 150,
  pricing_model = 'variants'
WHERE sku = 'SNAPCHAT-PLUS-1M';

-- تحديث Xbox Game Pass
UPDATE products SET 
  price_dzd = 2500,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 0
WHERE sku = 'XBOX-GAMEPASS-1M';

-- تحديث Spotify Premium
UPDATE products SET 
  price_dzd = 700,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 200
WHERE sku = 'SPOTIFY-PREMIUM-1M';

-- تحديث Deezer Premium
UPDATE products SET 
  price_dzd = 700,
  duration_days = 30,
  fulfillment_type = 'auto',
  stock_quantity = 75
WHERE sku = 'DEEZER-PREMIUM-1M';

-- تحديث ملاحظات التفعيل
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الحساب عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'GOOGLE-ONE-1M'
);

UPDATE product_translations SET 
  activation_instructions = 'Account details will be sent via WhatsApp within 24 hours.'
WHERE language = 'en' AND product_id IN (
  SELECT id FROM products WHERE sku = 'GOOGLE-ONE-1M'
);

-- تحديث ملاحظات Surfshark
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الحساب عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'SURFSHARK-1M'
);

-- تحديث ملاحظات ExpressVPN و HMA
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الحساب فوراً عبر البريد الإلكتروني.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku IN ('EXPRESSVPN-1M', 'HMA-VPN-1M')
);

-- تحديث ملاحظات Prime Video, Netflix, Crunchyroll
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الملف الشخصي الخاص عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku IN ('PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M')
);

-- تحديث ملاحظات IPTV
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الحساب عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'IPTV-1M'
);

-- تحديث ملاحظات TOD TV
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الملف الشخصي الخاص عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'TOD-TV-1M'
);

-- تحديث ملاحظات ChatGPT و Perplexity
UPDATE product_translations SET 
  activation_instructions = 'سيتم إرسال بيانات الحساب عبر WhatsApp خلال 24 ساعة.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku IN ('CHATGPT-PLUS-1M', 'PERPLEXITY-PRO-1M')
);

-- تحديث ملاحظات Canva Pro
UPDATE product_translations SET 
  activation_instructions = 'يرجى إرسال بريدك الإلكتروني المسجل في Canva عبر WhatsApp لإضافة الاشتراك.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'CANVA-PRO-1M'
);

-- تحديث ملاحظات Snapchat+
UPDATE product_translations SET 
  activation_instructions = 'يجب أن يكون لديك جهاز Android للتفعيل. سيتم إرسال التعليمات عبر WhatsApp.'
WHERE language = 'ar' AND product_id IN (
  SELECT id FROM products WHERE sku = 'SNAPCHAT-PLUS-1M'
);

-- إضافة variants للمنتجات متعددة الخيارات

-- Prime Video variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "شهر واحد", "en": "1 Month", "fr": "1 Mois"}',
  1,
  'months',
  700,
  'assisted',
  0,
  true,
  true
FROM products WHERE sku = 'PRIME-VIDEO-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "6 أشهر", "en": "6 Months", "fr": "6 Mois"}',
  6,
  'months',
  2900,
  'assisted',
  0,
  true,
  false
FROM products WHERE sku = 'PRIME-VIDEO-1M';

-- Netflix variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "شهر واحد", "en": "1 Month", "fr": "1 Mois"}',
  1,
  'months',
  900,
  'assisted',
  0,
  true,
  true
FROM products WHERE sku = 'NETFLIX-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "3 أشهر", "en": "3 Months", "fr": "3 Mois"}',
  3,
  'months',
  2200,
  'assisted',
  0,
  true,
  false
FROM products WHERE sku = 'NETFLIX-1M';

-- Crunchyroll variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "شهر واحد", "en": "1 Month", "fr": "1 Mois"}',
  1,
  'months',
  600,
  'assisted',
  0,
  true,
  true
FROM products WHERE sku = 'CRUNCHYROLL-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "6 أشهر", "en": "6 Months", "fr": "6 Mois"}',
  6,
  'months',
  2500,
  'assisted',
  0,
  true,
  false
FROM products WHERE sku = 'CRUNCHYROLL-1M';

-- IPTV variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "3 أشهر", "en": "3 Months", "fr": "3 Mois"}',
  3,
  'months',
  3200,
  'assisted',
  25,
  false,
  true
FROM products WHERE sku = 'IPTV-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "12 شهر", "en": "12 Months", "fr": "12 Mois"}',
  12,
  'months',
  6400,
  'assisted',
  25,
  false,
  false
FROM products WHERE sku = 'IPTV-1M';

-- ChatGPT Plus variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "3 أشهر (حساب مشترك)", "en": "3 Months (Shared Account)", "fr": "3 Mois (Compte Partagé)"}',
  3,
  'months',
  1400,
  'manual',
  100,
  false,
  true
FROM products WHERE sku = 'CHATGPT-PLUS-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "3 أشهر (حساب خاص)", "en": "3 Months (Private Account)", "fr": "3 Mois (Compte Privé)"}',
  3,
  'months',
  3200,
  'manual',
  50,
  false,
  false
FROM products WHERE sku = 'CHATGPT-PLUS-1M';

-- Perplexity Pro variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "12 شهر (حساب مشترك)", "en": "12 Months (Shared Account)", "fr": "12 Mois (Compte Partagé)"}',
  12,
  'months',
  1500,
  'manual',
  80,
  false,
  true
FROM products WHERE sku = 'PERPLEXITY-PRO-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "12 شهر (حساب خاص)", "en": "12 Months (Private Account)", "fr": "12 Mois (Compte Privé)"}',
  12,
  'months',
  2500,
  'manual',
  40,
  false,
  false
FROM products WHERE sku = 'PERPLEXITY-PRO-1M';

-- Snapchat+ variants
INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "شهر واحد", "en": "1 Month", "fr": "1 Mois"}',
  1,
  'months',
  600,
  'manual',
  150,
  false,
  true
FROM products WHERE sku = 'SNAPCHAT-PLUS-1M';

INSERT INTO product_variants (product_id, name, duration_value, duration_unit, price_dzd, fulfillment_type, stock_count, is_out_of_stock, is_default)
SELECT 
  id,
  '{"ar": "12 شهر", "en": "12 Months", "fr": "12 Mois"}',
  12,
  'months',
  3200,
  'manual',
  75,
  false,
  false
FROM products WHERE sku = 'SNAPCHAT-PLUS-1M';

SELECT 'تم تحديث جميع المنتجات بنجاح!' as status;