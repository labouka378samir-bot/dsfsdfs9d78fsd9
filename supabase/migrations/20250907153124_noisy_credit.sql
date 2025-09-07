/*
  # إصلاح مشكلة العمود المفقود stock_quantity
  
  1. المشكلة
    - الكود يحاول الوصول لعمود stock_quantity الذي لا يوجد
    - ProductGrid يحاول ترتيب المنتجات حسب stock_quantity
    - ProductModal يتحقق من stock_quantity
  
  2. الحل
    - حذف أي مراجع لعمود stock_quantity
    - التأكد من أن is_out_of_stock موجود ومحدث
    - تحديث indexes لاستخدام is_out_of_stock
    - إصلاح أي queries تستخدم stock_quantity
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

-- حذف عمود stock_quantity إذا كان موجود
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products DROP COLUMN stock_quantity;
  END IF;
END $$;

-- حذف عمود stock_count من product_variants إذا كان موجود
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'stock_count'
  ) THEN
    ALTER TABLE product_variants DROP COLUMN stock_count;
  END IF;
END $$;

-- التأكد من أن is_out_of_stock موجود في product_variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'is_out_of_stock'
  ) THEN
    ALTER TABLE product_variants ADD COLUMN is_out_of_stock boolean DEFAULT false;
  END IF;
END $$;

-- تحديث جميع المنتجات لتكون متوفرة بشكل افتراضي
UPDATE products 
SET is_out_of_stock = false 
WHERE is_out_of_stock IS NULL;

-- تحديث جميع variants لتكون متوفرة بشكل افتراضي
UPDATE product_variants 
SET is_out_of_stock = false 
WHERE is_out_of_stock IS NULL;

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

-- تحديث variants المحددة لتكون غير متوفرة
UPDATE product_variants 
SET is_out_of_stock = true 
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN (
    'PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M'
  )
);

-- حذف indexes القديمة التي تستخدم stock_quantity
DROP INDEX IF EXISTS idx_products_stock_priority;
DROP INDEX IF EXISTS idx_products_stock_status;

-- إنشاء indexes جديدة تستخدم is_out_of_stock
CREATE INDEX IF NOT EXISTS idx_products_availability_priority 
ON products(is_out_of_stock ASC, display_priority DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_availability 
ON product_variants(is_out_of_stock ASC, is_default DESC);

-- التحقق من النتائج
SELECT 'إصلاح مشكلة stock_quantity مكتمل!' as status;

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