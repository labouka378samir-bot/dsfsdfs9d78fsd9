/*
  # إصلاح مشكلة عرض المنتجات كـ Out of Stock
  
  1. المشاكل
    - جميع المنتجات تظهر out of stock في الواجهة
    - تحديثات الأدمن لا تنعكس على الواجهة
    - مشكلة في قراءة عمود is_out_of_stock
  
  2. الحلول
    - التأكد من وجود عمود is_out_of_stock
    - تحديث جميع المنتجات لتكون متوفرة
    - إصلاح RLS policies للقراءة والتحديث
    - إضافة policies للأدمن
*/

-- التأكد من وجود عمود is_out_of_stock
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_out_of_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN is_out_of_stock boolean DEFAULT false;
  END IF;
END $$;

-- تحديث جميع المنتجات لتكون متوفرة (false = متوفر)
UPDATE products 
SET is_out_of_stock = false 
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديد المنتجات غير المتوفرة فقط (حسب المطلوب)
UPDATE products 
SET is_out_of_stock = true 
WHERE sku IN (
  'APPLE-ONE-1M', 
  'APPLE-ARCADE-1M', 
  'APPLE-FITNESS-1M', 
  'PRIME-VIDEO-1M', 
  'NETFLIX-1M', 
  'CRUNCHYROLL-1M', 
  'XBOX-GAMEPASS-1M'
);

-- التأكد من أن باقي المنتجات متوفرة
UPDATE products 
SET is_out_of_stock = false 
WHERE sku IN (
  'GOOGLE-ONE-1M', 
  'APPLE-MUSIC-1M', 
  'APPLE-TV-1M', 
  'SURFSHARK-1M', 
  'EXPRESSVPN-1M', 
  'HMA-VPN-1M', 
  'IPTV-1M', 
  'TOD-TV-1M', 
  'CHATGPT-PLUS-1M', 
  'PERPLEXITY-PRO-1M', 
  'CANVA-PRO-1M', 
  'CAPCUT-PRO-1M', 
  'SNAPCHAT-PLUS-1M', 
  'SPOTIFY-PREMIUM-1M', 
  'DEEZER-PREMIUM-1M'
);

-- إصلاح RLS policies للمنتجات - السماح بالقراءة للجميع
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON products;
CREATE POLICY "All products are viewable by everyone"
  ON products FOR SELECT TO public USING (true);

-- إضافة RLS policies للأدمن للتحديث
DROP POLICY IF EXISTS "Service role can update products" ON products;
CREATE POLICY "Service role can update products"
  ON products FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert products" ON products;
CREATE POLICY "Service role can insert products"
  ON products FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete products" ON products;
CREATE POLICY "Service role can delete products"
  ON products FOR DELETE TO service_role USING (true);

-- إصلاح RLS policies للترجمات
DROP POLICY IF EXISTS "Service role can manage product_translations" ON product_translations;
CREATE POLICY "Service role can manage product_translations"
  ON product_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إصلاح RLS policies للمتغيرات
DROP POLICY IF EXISTS "Service role can manage product_variants" ON product_variants;
CREATE POLICY "Service role can manage product_variants"
  ON product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إصلاح RLS policies للفئات
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage category_translations" ON category_translations;
CREATE POLICY "Service role can manage category_translations"
  ON category_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إصلاح RLS policies للأكواد
DROP POLICY IF EXISTS "Service role can manage codes" ON codes;
CREATE POLICY "Service role can manage codes"
  ON codes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إصلاح RLS policies للطلبات
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage order_items" ON order_items;
CREATE POLICY "Service role can manage order_items"
  ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إصلاح RLS policies للإعدادات
DROP POLICY IF EXISTS "Service role can manage settings" ON settings;
CREATE POLICY "Service role can manage settings"
  ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_stock_status 
ON products(is_out_of_stock, is_active, display_priority DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_stock 
ON product_variants(is_out_of_stock, is_default);

-- التحقق من النتائج
SELECT 'إصلاح مشكلة Out of Stock مكتمل!' as status;

-- عرض إحصائيات المنتجات
SELECT 
  'المنتجات المتوفرة:' as info,
  count(*) as count 
FROM products 
WHERE is_out_of_stock = false AND is_active = true

UNION ALL

SELECT 
  'المنتجات غير المتوفرة:' as info,
  count(*) as count 
FROM products 
WHERE is_out_of_stock = true AND is_active = true

UNION ALL

SELECT 
  'إجمالي المنتجات النشطة:' as info,
  count(*) as count 
FROM products 
WHERE is_active = true;