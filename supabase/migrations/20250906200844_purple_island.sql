/*
  # ترتيب المنتجات - المتوفرة أولاً
  
  1. تحديث display_priority للمنتجات المتوفرة
  2. إعطاء أولوية أعلى للمنتجات المتوفرة
  3. ترتيب المنتجات غير المتوفرة في الأخير
*/

-- تحديث أولوية العرض للمنتجات المتوفرة (stock > 0)
UPDATE products 
SET display_priority = 100 
WHERE stock_quantity > 0 AND is_active = true;

-- تحديث أولوية العرض للمنتجات غير المتوفرة (stock = 0)
UPDATE products 
SET display_priority = 1 
WHERE stock_quantity = 0 AND is_active = true;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_stock_priority 
ON products(stock_quantity DESC, display_priority DESC, created_at DESC);

-- تحديث ترتيب المنتجات المحددة لتكون في المقدمة (المتوفرة)
UPDATE products SET display_priority = 150 WHERE sku = 'GOOGLE-ONE-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 140 WHERE sku = 'APPLE-MUSIC-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 135 WHERE sku = 'APPLE-TV-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 130 WHERE sku = 'SURFSHARK-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 125 WHERE sku = 'EXPRESSVPN-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 120 WHERE sku = 'HMA-VPN-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 115 WHERE sku = 'IPTV-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 110 WHERE sku = 'TOD-TV-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 105 WHERE sku = 'CHATGPT-PLUS-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 100 WHERE sku = 'PERPLEXITY-PRO-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 95 WHERE sku = 'CANVA-PRO-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 90 WHERE sku = 'CAPCUT-PRO-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 85 WHERE sku = 'SNAPCHAT-PLUS-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 80 WHERE sku = 'SPOTIFY-PREMIUM-1M' AND stock_quantity > 0;
UPDATE products SET display_priority = 75 WHERE sku = 'DEEZER-PREMIUM-1M' AND stock_quantity > 0;

-- تحديث المنتجات غير المتوفرة لتكون في الأخير
UPDATE products SET display_priority = 10 WHERE sku = 'APPLE-ONE-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 9 WHERE sku = 'APPLE-ARCADE-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 8 WHERE sku = 'APPLE-FITNESS-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 7 WHERE sku = 'PRIME-VIDEO-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 6 WHERE sku = 'NETFLIX-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 5 WHERE sku = 'CRUNCHYROLL-1M' AND stock_quantity = 0;
UPDATE products SET display_priority = 4 WHERE sku = 'XBOX-GAMEPASS-1M' AND stock_quantity = 0;

SELECT 'تم ترتيب المنتجات - المتوفرة أولاً!' as status;