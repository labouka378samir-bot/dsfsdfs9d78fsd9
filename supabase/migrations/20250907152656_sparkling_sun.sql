/*
  # تحديث حالة مخزون Snapchat+ إلى متوفر
  
  1. التغييرات
    - تحديث Snapchat+ ليكون متوفر (is_out_of_stock = false)
    - تحديث جميع variants الخاصة بـ Snapchat+ لتكون متوفرة
    - تحديث أولوية العرض
  
  2. الأمان
    - استخدام service_role policies الموجودة
*/

-- تحديث Snapchat+ ليكون متوفر
UPDATE products 
SET 
  is_out_of_stock = false,
  display_priority = 85,
  updated_at = now()
WHERE sku = 'SNAPCHAT-PLUS-1M';

-- تحديث جميع variants الخاصة بـ Snapchat+ لتكون متوفرة
UPDATE product_variants 
SET 
  is_out_of_stock = false,
  updated_at = now()
WHERE product_id IN (
  SELECT id FROM products WHERE sku = 'SNAPCHAT-PLUS-1M'
);

-- التحقق من النتائج
SELECT 'تم تحديث Snapchat+ ليكون متوفر بنجاح!' as status;

-- عرض حالة Snapchat+ الحالية
SELECT 
  sku,
  is_out_of_stock,
  is_active,
  display_priority
FROM products 
WHERE sku = 'SNAPCHAT-PLUS-1M';

-- عرض حالة variants
SELECT 
  pv.name,
  pv.is_out_of_stock,
  pv.is_default
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.sku = 'SNAPCHAT-PLUS-1M';