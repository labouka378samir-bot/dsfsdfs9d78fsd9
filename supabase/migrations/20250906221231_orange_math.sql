/*
  # إصلاح RLS INSERT policy لجدول orders
  
  1. المشكلة
    - RLS policy للـ orders كان يسمح بـ WITH CHECK (true)
    - هذا يسمح للمستخدمين بإنشاء orders بـ user_id خاطئ
    - عندما يحاول النظام إنشاء order_items، RLS policy يرفض العملية
  
  2. الحل
    - تحديث RLS policy للـ orders INSERT
    - المستخدم المسجل يمكنه إنشاء order فقط بـ user_id الخاص به
    - المستخدم المجهول يمكنه إنشاء order فقط بـ user_id = NULL
*/

-- حذف RLS policy القديم للـ orders INSERT
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- إنشاء RLS policy جديد محدود للـ orders INSERT
CREATE POLICY "Users can create orders with correct user_id"
  ON orders FOR INSERT TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );