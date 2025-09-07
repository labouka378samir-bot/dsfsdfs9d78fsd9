/*
  # إصلاح عرض حالة المخزون في الأدمن داشبورد
  
  1. المشكلة
    - الأدمن يعرض جميع المنتجات كـ "Out of Stock"
    - عدم تطابق مع حالة المنتجات الفعلية
  
  2. الحل
    - تحديث حالة المنتجات بوضوح
    - التأكد من القيم الصحيحة لـ is_out_of_stock
    - إصلاح البيانات المتضاربة
*/

-- تحديث جميع المنتجات لتكون متوفرة أولاً
UPDATE products 
SET 
  is_out_of_stock = false,
  updated_at = now()
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديد المنتجات غير المتوفرة فقط (حسب المطلوب)
UPDATE products 
SET 
  is_out_of_stock = true,
  updated_at = now()
WHERE sku IN (
  'APPLE-ONE-1M', 
  'APPLE-ARCADE-1M', 
  'APPLE-FITNESS-1M', 
  'PRIME-VIDEO-1M', 
  'NETFLIX-1M', 
  'CRUNCHYROLL-1M', 
  'XBOX-GAMEPASS-1M'
);

-- التأكد من أن المنتجات المتوفرة لها القيمة الصحيحة
UPDATE products 
SET 
  is_out_of_stock = false,
  updated_at = now()
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

-- تحديث product_variants أيضاً
UPDATE product_variants 
SET 
  is_out_of_stock = false,
  updated_at = now()
WHERE is_out_of_stock IS NULL OR is_out_of_stock = true;

-- تحديث variants المحددة لتكون غير متوفرة
UPDATE product_variants 
SET 
  is_out_of_stock = true,
  updated_at = now()
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN (
    'PRIME-VIDEO-1M', 'NETFLIX-1M', 'CRUNCHYROLL-1M'
  )
);

-- التحقق من النتائج وعرض الحالة الصحيحة
SELECT 'إصلاح عرض المخزون في الأدمن مكتمل!' as status;

-- عرض حالة المنتجات بوضوح
SELECT 
  sku,
  CASE 
    WHEN is_out_of_stock = true THEN 'OUT OF STOCK'
    WHEN is_out_of_stock = false THEN 'IN STOCK'
    ELSE 'UNKNOWN'
  END as stock_status,
  is_active,
  display_priority
FROM products 
WHERE is_active = true
ORDER BY is_out_of_stock ASC, display_priority DESC;

-- عرض إحصائيات نهائية
SELECT 
  'المنتجات المتوفرة (IN STOCK):' as info,
  count(*) as count 
FROM products 
WHERE is_out_of_stock = false AND is_active = true

UNION ALL

SELECT 
  'المنتجات غير المتوفرة (OUT OF STOCK):' as info,
  count(*) as count 
FROM products 
WHERE is_out_of_stock = true AND is_active = true;