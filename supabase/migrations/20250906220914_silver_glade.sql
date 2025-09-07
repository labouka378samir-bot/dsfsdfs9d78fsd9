/*
  # إصلاح RLS SELECT policy لجدول orders
  
  1. المشكلة
    - order_items RLS policy يحتاج للوصول لجدول orders
    - لكن orders SELECT policy لا تسمح للمستخدمين المجهولين بالقراءة
    - هذا يمنع إنشاء order_items للطلبات المجهولة
  
  2. الحل
    - إضافة SELECT policy جديدة للمستخدمين المجهولين
    - السماح بقراءة الطلبات التي user_id = NULL
    - الحفاظ على الأمان للمستخدمين المسجلين
*/

-- حذف SELECT policy الحالية إذا كانت موجودة
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- إنشاء SELECT policy جديدة للمستخدمين المسجلين
CREATE POLICY "Authenticated users can view their own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- إنشاء SELECT policy للمستخدمين المجهولين
CREATE POLICY "Anonymous users can view anonymous orders"
  ON orders FOR SELECT TO anon
  USING (user_id IS NULL);

-- التحقق من النجاح
SELECT 'تم إصلاح RLS SELECT policies لجدول orders بنجاح!' as status;