/*
  # تحديث سعر الصرف إلى 1$ = 250 دج
  
  1. تحديث إعداد سعر الصرف في جدول settings
  2. ضمان أن السعر الجديد 250 بدلاً من 135
*/

-- تحديث سعر الصرف في جدول الإعدادات
UPDATE settings 
SET value = '250', updated_at = now()
WHERE key = 'exchange_rate_usd_to_dzd';

-- إدراج الإعداد إذا لم يكن موجوداً
INSERT INTO settings (key, value, created_at, updated_at)
SELECT 'exchange_rate_usd_to_dzd', '250', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE key = 'exchange_rate_usd_to_dzd'
);

-- التحقق من التحديث
SELECT 'تم تحديث سعر الصرف إلى 1$ = 250 دج بنجاح!' as status;
SELECT key, value FROM settings WHERE key = 'exchange_rate_usd_to_dzd';