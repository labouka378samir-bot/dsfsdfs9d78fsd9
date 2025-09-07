/*
  # إصلاح مشكلة عرض المخزون في الأدمن داشبورد
  
  1. المشكلة
    - الأدمن يعرض جميع المنتجات كـ "Out of Stock"
    - الموقع يعرض المنتجات كمتوفرة
    - عدم تطابق في البيانات
  
  2. الحل
    - التأكد من وجود عمود is_out_of_stock
    - تحديث جميع المنتجات لحالة صحيحة
    - إصلاح RLS policies
    - تحديث المنتجات المحددة حسب المطلوب
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

-- تحديث جميع المنتجات لتكون متوفرة بشكل افتراضي
UPDATE products 
SET is_out_of_stock = false, updated_at = now()
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديد المنتجات غير المتوفرة فقط (حسب المطلوب)
UPDATE products 
SET is_out_of_stock = true, updated_at = now()
WHERE sku IN (
  'APPLE-ONE-1M', 
  'APPLE-ARCADE-1M', 
  'APPLE-FITNESS-1M', 
  'PRIME-VIDEO-1M', 
  'NETFLIX-1M', 
  'CRUNCHYROLL-1M', 
  'XBOX-GAMEPASS-1M'
);

-- التأكد من أن Snapchat+ متوفر
UPDATE products 
SET is_out_of_stock = false, updated_at = now()
WHERE sku = 'SNAPCHAT-PLUS-1M';

-- التأكد من أن باقي المنتجات متوفرة
UPDATE products 
SET is_out_of_stock = false, updated_at = now()
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
  'SPOTIFY-PREMIUM-1M', 
  'DEEZER-PREMIUM-1M'
);

-- تحديث product_variants أيضاً
UPDATE product_variants 
SET is_out_of_stock = false, updated_at = now()
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديث variants المحددة لتكون غير متوفرة
UPDATE product_variants 
SET is_out_of_stock = true, updated_at = now()
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN (
    'PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M'
  )
);

-- إصلاح RLS policies للقراءة
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON products;
CREATE POLICY "All products are viewable by everyone"
  ON products FOR SELECT TO public USING (true);

-- إضافة RLS policies للأدمن
DROP POLICY IF EXISTS "Service role can update products" ON products;
CREATE POLICY "Service role can update products"
  ON products FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert products" ON products;
CREATE POLICY "Service role can insert products"
  ON products FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete products" ON products;
CREATE POLICY "Service role can delete products"
  ON products FOR DELETE TO service_role USING (true);

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

-- عرض حالة المنتجات الرئيسية
SELECT 
  sku,
  is_out_of_stock,
  is_active,
  display_priority
FROM products 
WHERE is_active = true
ORDER BY is_out_of_stock ASC, display_priority DESC;