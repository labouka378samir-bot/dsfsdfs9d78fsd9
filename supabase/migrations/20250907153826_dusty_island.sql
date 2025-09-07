/*
  # إضافة عمود variant_id إلى جدول carts
  
  1. المشكلة
    - الكود يحاول الوصول لعمود variant_id في جدول carts
    - العمود غير موجود في قاعدة البيانات
    - هذا يسبب خطأ "column carts.variant_id does not exist"
  
  2. الحل
    - إضافة عمود variant_id كـ UUID
    - ربطه بجدول product_variants
    - إضافة index لتحسين الأداء
    - تحديث RLS policies إذا لزم الأمر
*/

-- إضافة عمود variant_id إلى جدول carts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carts' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE carts ADD COLUMN variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_carts_variant_id ON carts(variant_id);

-- تحديث RLS policies للـ carts إذا لزم الأمر
-- (الـ policies الحالية تعمل مع العمود الجديد)

-- التحقق من النتائج
SELECT 'تم إضافة عمود variant_id إلى جدول carts بنجاح!' as status;

-- عرض هيكل جدول carts المحدث
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carts' 
ORDER BY ordinal_position;