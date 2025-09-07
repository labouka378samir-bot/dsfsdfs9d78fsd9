/*
  # إصلاح مشكلة Out of Stock وتحديثات الأدمن
  
  1. المشاكل
    - جميع المنتجات تظهر out of stock
    - تحديثات الأدمن لا تعمل
    - عمود is_out_of_stock قد يكون مفقود أو له قيم خاطئة
  
  2. الحلول
    - إضافة عمود is_out_of_stock إذا كان مفقود
    - تحديث جميع المنتجات لتكون متوفرة (false)
    - إصلاح RLS policies للأدمن
    - إضافة policies للتحديث والحذف
*/

-- إضافة عمود is_out_of_stock إذا كان مفقود
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

-- تحديث منتجات محددة لتكون متوفرة
UPDATE products 
SET is_out_of_stock = false 
WHERE sku IN (
  'GOOGLE-ONE-1M', 'APPLE-MUSIC-1M', 'APPLE-TV-1M', 'SURFSHARK-1M', 
  'EXPRESSVPN-1M', 'HMA-VPN-1M', 'IPTV-1M', 'TOD-TV-1M', 
  'CHATGPT-PLUS-1M', 'PERPLEXITY-PRO-1M', 'CANVA-PRO-1M', 
  'CAPCUT-PRO-1M', 'SNAPCHAT-PLUS-1M', 'SPOTIFY-PREMIUM-1M', 'DEEZER-PREMIUM-1M'
);

-- تحديث المنتجات غير المتوفرة فقط
UPDATE products 
SET is_out_of_stock = true 
WHERE sku IN (
  'APPLE-ONE-1M', 'APPLE-ARCADE-1M', 'APPLE-FITNESS-1M', 
  'PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M', 'XBOX-GAMEPASS-1M'
);

-- إضافة RLS policies للأدمن للتحديث والحذف
DROP POLICY IF EXISTS "Service role can manage products" ON products;
DROP POLICY IF EXISTS "Service role can manage product_translations" ON product_translations;
DROP POLICY IF EXISTS "Service role can manage product_variants" ON product_variants;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage category_translations" ON category_translations;
DROP POLICY IF EXISTS "Service role can manage codes" ON codes;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage order_items" ON order_items;
DROP POLICY IF EXISTS "Service role can manage settings" ON settings;

-- إنشاء policies جديدة للأدمن (service role)
CREATE POLICY "Service role can manage products"
  ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage product_translations"
  ON product_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage product_variants"
  ON product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage category_translations"
  ON category_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage codes"
  ON codes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage order_items"
  ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage settings"
  ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- تحديث product_variants لتكون متوفرة
UPDATE product_variants 
SET is_out_of_stock = false 
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديث variants محددة لتكون غير متوفرة
UPDATE product_variants 
SET is_out_of_stock = true 
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN (
    'PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M'
  )
);

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_availability 
ON products(is_out_of_stock, is_active, display_priority DESC);

-- التحقق من النتائج
SELECT 'إصلاح مشكلة Out of Stock مكتمل!' as status;

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
WHERE is_out_of_stock = true AND is_active = true;