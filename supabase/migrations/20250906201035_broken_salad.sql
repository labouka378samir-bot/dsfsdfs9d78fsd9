/*
  # تحديث صور المنتجات
  
  1. تبديل صورة Xbox Game Pass مع Google One
  2. تبديل صورة Deezer Premium مع Xbox Game Pass
  3. وضع صورة جديدة لـ Deezer Premium
*/

-- الحصول على الصور الحالية
DO $$
DECLARE
    xbox_image text;
    google_image text;
    deezer_image text;
BEGIN
    -- الحصول على صورة Xbox Game Pass الحالية
    SELECT image_url INTO xbox_image FROM products WHERE sku = 'XBOX-GAMEPASS-1M';
    
    -- الحصول على صورة Google One الحالية
    SELECT image_url INTO google_image FROM products WHERE sku = 'GOOGLE-ONE-1M';
    
    -- الحصول على صورة Deezer الحالية
    SELECT image_url INTO deezer_image FROM products WHERE sku = 'DEEZER-PREMIUM-1M';
    
    -- تبديل الصور
    -- وضع صورة Xbox القديمة في Google One
    UPDATE products SET image_url = xbox_image WHERE sku = 'GOOGLE-ONE-1M';
    
    -- وضع صورة Deezer القديمة في Xbox Game Pass
    UPDATE products SET image_url = deezer_image WHERE sku = 'XBOX-GAMEPASS-1M';
    
    -- وضع الصورة الجديدة في Deezer
    UPDATE products SET image_url = 'https://merlinnetwork.org/wp-content/uploads/2023/08/Deezer.png' WHERE sku = 'DEEZER-PREMIUM-1M';
    
END $$;

SELECT 'تم تحديث صور المنتجات بنجاح!' as status;