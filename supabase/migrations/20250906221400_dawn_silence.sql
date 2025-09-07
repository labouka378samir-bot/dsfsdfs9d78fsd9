@@ .. @@
 CREATE POLICY "Users can create order items"
   ON order_items FOR INSERT TO authenticated, anon
   WITH CHECK (
     EXISTS (
       SELECT 1 FROM orders 
-      WHERE orders.id = order_items.order_id 
-      AND (
-        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
-        (auth.uid() IS NULL AND orders.user_id IS NULL)
-      )
+      WHERE orders.id = order_items.order_id
     )
   );