@@ .. @@
 CREATE POLICY "Order items are viewable by order owner"
   ON order_items FOR SELECT TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM orders 
       WHERE orders.id = order_items.order_id 
       AND orders.user_id = auth.uid()
     )
   );
+
+CREATE POLICY "Users can create order items"
+  ON order_items FOR INSERT TO public
+  WITH CHECK (
+    EXISTS (
+      SELECT 1 FROM orders 
+      WHERE orders.id = order_items.order_id 
+      AND (
+        orders.user_id = auth.uid() OR 
+        orders.user_id IS NULL
+      )
+    )
+  );
 
 -- Settings (public read)