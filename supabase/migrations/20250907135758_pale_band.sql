/*
  # حذف Stock Quantity وإضافة Out of Stock
  
  1. إضافة عمود is_out_of_stock للمنتجات
  2. تحديث المنتجات الحالية بناءً على stock_quantity
  3. حذف عمود stock_quantity
  4. تحديث product_variants أيضاً
*/

-- إضافة عمود is_out_of_stock للمنتجات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_out_of_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN is_out_of_stock boolean DEFAULT false;
  END IF;
END $$;

-- تحديث المنتجات الحالية: إذا كان stock_quantity = 0 فهو out of stock
UPDATE products 
SET is_out_of_stock = (stock_quantity = 0)
WHERE stock_quantity IS NOT NULL;

-- حذف عمود stock_quantity من products
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products DROP COLUMN stock_quantity;
  END IF;
END $$;

-- تحديث product_variants: تحويل stock_count = 0 إلى is_out_of_stock = true
UPDATE product_variants 
SET is_out_of_stock = (stock_count = 0)
WHERE stock_count IS NOT NULL;

-- حذف عمود stock_count من product_variants
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'stock_count'
  ) THEN
    ALTER TABLE product_variants DROP COLUMN stock_count;
  END IF;
END $$;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_out_of_stock 
ON products(is_out_of_stock, display_priority DESC, created_at DESC);

SELECT 'تم حذف Stock Quantity وإضافة Out of Stock بنجاح!' as status;