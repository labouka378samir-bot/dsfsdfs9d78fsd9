/*
  # إضافة عمود telegram_notified للطلبات
  
  1. التغييرات
    - إضافة عمود telegram_notified إلى جدول orders
    - تحديد القيمة الافتراضية false
    - إضافة index لتحسين الأداء
  
  2. الهدف
    - تتبع الطلبات التي تم إرسال إشعار تلغرام لها
    - منع إرسال إشعارات مكررة
*/

-- إضافة عمود telegram_notified إلى جدول orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'telegram_notified'
  ) THEN
    ALTER TABLE orders ADD COLUMN telegram_notified boolean DEFAULT false;
  END IF;
END $$;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_orders_telegram_notified 
ON orders(telegram_notified, status, created_at);

-- تحديث الطلبات الموجودة لتكون غير مُشعرة
UPDATE orders 
SET telegram_notified = false 
WHERE telegram_notified IS NULL;

SELECT 'تم إضافة عمود telegram_notified بنجاح!' as status;