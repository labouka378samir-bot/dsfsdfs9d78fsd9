/*
  # إعداد قاعدة بيانات جديدة - ATHMANEBZN STORE
  
  مشروع Supabase جديد تماماً مع:
  1. جداول نظيفة وبسيطة
  2. 9 فئات مع ترجمات كاملة
  3. 22 منتج مع أوصاف مفصلة
  4. RLS policies آمنة
  5. بدون triggers معقدة
*/

-- ==================== CREATE TYPES ====================

CREATE TYPE fulfillment_type AS ENUM ('auto', 'manual', 'assisted');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'delivered', 'refunded');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered');

-- ==================== CREATE TABLES ====================

-- 1. Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Category Translations
CREATE TABLE category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  language text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  UNIQUE(category_id, language)
);

-- 3. Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sku text UNIQUE NOT NULL,
  slug text,
  price_usd decimal(10,2) NOT NULL DEFAULT 0,
  price_dzd decimal(10,2) DEFAULT 0,
  duration_days integer DEFAULT 0,
  fulfillment_type fulfillment_type DEFAULT 'manual',
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  image_url text DEFAULT '',
  logo_url text DEFAULT '',
  pricing_model text DEFAULT 'simple' CHECK (pricing_model IN ('simple', 'variants')),
  required_fields text[] DEFAULT '{}',
  badges text[] DEFAULT '{}',
  display_priority integer DEFAULT 0,
  meta_title jsonb DEFAULT '{}',
  meta_description jsonb DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Product Translations
CREATE TABLE product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  language text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  activation_instructions text DEFAULT '',
  UNIQUE(product_id, language)
);

-- 5. Product Variants
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name jsonb DEFAULT '{}',
  duration_value integer DEFAULT 1,
  duration_unit text DEFAULT 'months' CHECK (duration_unit IN ('days', 'months', 'years')),
  price_usd decimal(10,2) DEFAULT 0,
  price_dzd decimal(10,2) DEFAULT 0,
  fulfillment_type fulfillment_type DEFAULT 'manual',
  stock_count integer DEFAULT 0,
  is_out_of_stock boolean DEFAULT false,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Shopping Cart
CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  session_id text DEFAULT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- 7. Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  order_number text UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method text DEFAULT NULL,
  payment_id text DEFAULT NULL,
  currency text DEFAULT 'USD',
  subtotal decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) DEFAULT 0,
  customer_email text DEFAULT NULL,
  customer_phone text DEFAULT NULL,
  payment_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) DEFAULT 0,
  total_price decimal(10,2) DEFAULT 0,
  delivery_code text DEFAULT NULL,
  delivery_status delivery_status DEFAULT 'pending',
  delivered_at timestamptz DEFAULT NULL
);

-- 9. Product Codes
CREATE TABLE codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  code text NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz DEFAULT NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL
);

-- 10. Settings
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==================== ENABLE RLS ====================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ==================== CREATE POLICIES ====================

-- Categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Category translations are viewable by everyone"
  ON category_translations FOR SELECT TO public USING (true);

-- Products (public read for active products)
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Product translations are viewable by everyone"
  ON product_translations FOR SELECT TO public USING (true);

CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT TO public USING (true);

-- Cart policies
CREATE POLICY "Users can view their own cart items"
  ON carts FOR SELECT TO public
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can insert their own cart items"
  ON carts FOR INSERT TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can update their own cart items"
  ON carts FOR UPDATE TO public
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete their own cart items"
  ON carts FOR DELETE TO public
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Order policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Order items are viewable by order owner"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Settings (public read)
CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT TO public USING (true);

-- ==================== CREATE INDEXES ====================

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==================== INSERT DATA ====================

-- Insert Categories
INSERT INTO categories (slug) VALUES 
  ('apple-products'),
  ('vpn-services'),
  ('streaming-platforms'),
  ('artificial-intelligence'),
  ('design-production'),
  ('social-content'),
  ('cloud-storage'),
  ('gaming'),
  ('music');

-- Insert Category Translations
INSERT INTO category_translations (category_id, language, name, description) 
SELECT 
  c.id,
  t.language,
  t.name,
  t.description
FROM categories c
CROSS JOIN (
  VALUES 
    ('apple-products', 'ar', '🍏 منتجات Apple', 'خدمات واشتراكات آبل المتنوعة'),
    ('apple-products', 'en', '🍏 Apple Products', 'Various Apple services and subscriptions'),
    ('vpn-services', 'ar', '🌐 خدمات VPN', 'شبكات خاصة افتراضية للحماية والخصوصية'),
    ('vpn-services', 'en', '🌐 VPN Services', 'Virtual private networks for protection and privacy'),
    ('streaming-platforms', 'ar', '🎬 منصات بث', 'خدمات بث الأفلام والمسلسلات'),
    ('streaming-platforms', 'en', '🎬 Streaming Platforms', 'Movie and series streaming services'),
    ('artificial-intelligence', 'ar', '🤖 ذكاء اصطناعي', 'أدوات وخدمات الذكاء الاصطناعي'),
    ('artificial-intelligence', 'en', '🤖 Artificial Intelligence', 'AI tools and services'),
    ('design-production', 'ar', '🎨 إنتاج وتصميم', 'أدوات التصميم والإنتاج الإبداعي'),
    ('design-production', 'en', '🎨 Design & Production', 'Creative design and production tools'),
    ('social-content', 'ar', '📱 تواصل ومحتوى', 'منصات التواصل الاجتماعي والمحتوى'),
    ('social-content', 'en', '📱 Social & Content', 'Social media and content platforms'),
    ('cloud-storage', 'ar', '☁️ تخزين وخدمات سحابية', 'خدمات التخزين السحابي والحوسبة'),
    ('cloud-storage', 'en', '☁️ Cloud Storage & Services', 'Cloud storage and computing services'),
    ('gaming', 'ar', '🎮 ألعاب', 'منصات وخدمات الألعاب'),
    ('gaming', 'en', '🎮 Gaming', 'Gaming platforms and services'),
    ('music', 'ar', '🎶 موسيقى', 'منصات بث الموسيقى والصوتيات'),
    ('music', 'en', '🎶 Music', 'Music and audio streaming platforms')
) AS t(slug, language, name, description)
WHERE c.slug = t.slug;

-- Insert Products
INSERT INTO products (category_id, sku, price_usd, price_dzd, duration_days, stock_quantity, is_active, image_url, slug) 
SELECT 
  c.id,
  p.sku,
  p.price_usd,
  p.price_dzd,
  p.duration_days,
  p.stock_quantity,
  p.is_active,
  p.image_url,
  p.slug
FROM categories c
CROSS JOIN (
  VALUES 
    ('apple-products', 'APPLE-ONE-1M', 16.95, 2288.25, 30, 50, true, 'https://ipadizate.com/hero/2024/11/apple-one.1732199413.9605.jpg?width=1200', 'apple-one'),
    ('cloud-storage', 'GOOGLE-ONE-1M', 9.99, 1348.65, 30, 90, true, 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg', 'google-one'),
    ('apple-products', 'APPLE-MUSIC-1M', 10.99, 1483.65, 30, 100, true, 'https://routenote.com/blog/wp-content/uploads/2025/02/en-us-large1x2.png', 'apple-music'),
    ('apple-products', 'APPLE-TV-1M', 6.99, 943.65, 30, 75, true, 'https://mybroadband.co.za/news/wp-content/uploads/2025/02/AppleTv-600x338.jpg', 'apple-tv-plus'),
    ('apple-products', 'APPLE-ARCADE-1M', 4.99, 673.65, 30, 80, true, 'https://knowtechie.com/wp-content/uploads/2019/10/apple-arcade-main.jpg', 'apple-arcade'),
    ('apple-products', 'APPLE-FITNESS-1M', 9.99, 1348.65, 30, 60, true, 'https://images.macrumors.com/article-new/2020/11/Apple-fitness-plus-feature.jpg', 'apple-fitness-plus'),
    ('vpn-services', 'SURFSHARK-1M', 12.95, 1748.25, 30, 40, true, 'https://chaychaytechtime.com/wp-content/uploads/2021/06/Surfshark-The-BEST-VPN-Service-in-2021.png', 'surfshark-vpn'),
    ('vpn-services', 'EXPRESSVPN-1M', 12.95, 1748.25, 30, 35, true, 'https://www.expressvpn.com/wp-ws/uploads-expressvpn/2023/04/expressvpn-vertical-logo-white-on-red.jpeg', 'expressvpn'),
    ('vpn-services', 'HMA-VPN-1M', 11.99, 1618.65, 30, 45, true, 'https://www.pcworld.com/wp-content/uploads/2025/06/HMA-Logo-big.png', 'hma-vpn'),
    ('streaming-platforms', 'PRIME-VIDEO-1M', 8.99, 1213.65, 30, 70, true, 'https://i.vimeocdn.com/video/1586162092-020d20c6f8b5fd388ed06ba6929021b826007c55c5fa007f23d6fbac44c2e489-d?f=webp', 'prime-video'),
    ('streaming-platforms', 'NETFLIX-1M', 15.49, 2091.15, 30, 90, true, 'https://www.correiobraziliense.com.br/aqui/wp-content/uploads/2025/08/netflix-em-alta-1.jpg', 'netflix'),
    ('streaming-platforms', 'CRUNCHYROLL-1M', 7.99, 1078.65, 30, 55, true, 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000042000/e965921d2670a197008fe9403e50aaa0b150eabcaab4ce8b0c860d75ba4d1ee6', 'crunchyroll'),
    ('streaming-platforms', 'IPTV-1M', 19.99, 2698.65, 30, 25, true, 'https://www.u-buy.com.au/productimg/?image=aHR0cHM6Ly9pbWFnZXMtY2RuLnVidXkuY28uaW4vNjMzZmVlOWMzYTE2YTQ2M2FkMmY3Mzg4LWlwdHYtc3Vic2NyaXB0aW9uLW5vdC1ib3gtaW5jbHVkaW5nLmpwZw.jpg', 'iptv'),
    ('streaming-platforms', 'TOD-TV-1M', 14.99, 2023.65, 30, 30, true, 'https://i.imgur.com/9Wzu3JJ.jpeg', 'tod-tv'),
    ('artificial-intelligence', 'CHATGPT-PLUS-1M', 20.00, 2700.00, 30, 100, true, 'https://diplo-media.s3.eu-central-1.amazonaws.com/2025/03/openai-chatgpt-surge-deepseek.jpg', 'chatgpt-plus'),
    ('artificial-intelligence', 'PERPLEXITY-PRO-1M', 20.00, 2700.00, 30, 80, true, 'https://justainews.com/wp-content/uploads/2024/10/perplexity.jpg', 'perplexity-pro'),
    ('design-production', 'CANVA-PRO-1M', 14.99, 2023.65, 30, 120, true, 'https://s2-techtudo.glbimg.com/0ItEiI8KKVY37wJx77CaybiHngs=/0x0:900x470/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2024/d/6/Ux6G0lSRm87BVXRAZ8nQ/canva-online-artigo.jpg', 'canva-pro'),
    ('design-production', 'CAPCUT-PRO-1M', 9.99, 1348.65, 30, 85, true, 'https://i.pcmag.com/imagery/reviews/00e02Ss3KiOLKE7Ivb8SQ0P-1..v1632757092.png', 'capcut-pro'),
    ('social-content', 'SNAPCHAT-PLUS-1M', 3.99, 538.65, 30, 150, true, 'https://buffer.com/resources/content/images/resources/wp-content/uploads/2017/01/snapchat-specs.jpg', 'snapchat-plus'),
    ('gaming', 'XBOX-GAMEPASS-1M', 16.99, 2293.65, 30, 65, true, 'https://lh3.googleusercontent.com/XDVbmzTjafp7UArXmYxHZoaJCf4d1ZcTGDNLvtl9RUeojOmpC4q6Ntw-3kc-a_HS29jT55aZPRS7W8hwDvTQcnmFJ3rchdxV3P9ELg=e365-v1-rw-pa-nu-w1200', 'xbox-gamepass'),
    ('music', 'SPOTIFY-PREMIUM-1M', 10.99, 1483.65, 30, 200, true, 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/2024-spotify-brand-assets-media-kit.jpg', 'spotify-premium'),
    ('music', 'DEEZER-PREMIUM-1M', 10.99, 1483.65, 30, 75, true, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJKW4zmiez2_i5j-ozeE-U0EV1a2fdyGrOLw&s', 'deezer-premium')
) AS p(category_slug, sku, price_usd, price_dzd, duration_days, stock_quantity, is_active, image_url, slug)
WHERE c.slug = p.category_slug;

-- Insert Product Translations
INSERT INTO product_translations (product_id, language, name, description, activation_instructions) 
SELECT 
  p.id,
  t.language,
  t.name,
  t.description,
  t.activation_instructions
FROM products p
CROSS JOIN (
  VALUES 
    ('APPLE-ONE-1M', 'ar', 'Apple One', 'باقة تجمع موسيقى، أفلام، ألعاب وتخزين سحابي في اشتراك واحد متكامل من آبل.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('APPLE-ONE-1M', 'en', 'Apple One', 'A bundle combining music, movies, games, and cloud storage in one complete Apple subscription.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('GOOGLE-ONE-1M', 'ar', 'Google One', '2 تيرابايت تخزين سحابي مع Gemini Pro وVeo 3 لإنشاء نصوص وصور وفيديوهات بالذكاء الاصطناعي.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('GOOGLE-ONE-1M', 'en', 'Google One', '2TB storage with Gemini Pro and Veo 3 to generate text, images, and videos with AI.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('APPLE-MUSIC-1M', 'ar', 'Apple Music', 'استمع لملايين الأغاني والبودكاست بجودة عالية وبدون إعلانات.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('APPLE-MUSIC-1M', 'en', 'Apple Music', 'Listen to millions of songs and podcasts in high quality, ad-free.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('APPLE-TV-1M', 'ar', 'Apple TV+', 'محتوى أصلي من آبل يشمل أفضل المسلسلات والأفلام بجودة عالية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('APPLE-TV-1M', 'en', 'Apple TV+', 'Original Apple content with top-quality series and movies.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('APPLE-ARCADE-1M', 'ar', 'Apple Arcade', 'مئات الألعاب الممتعة بلا إعلانات أو مشتريات داخلية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('APPLE-ARCADE-1M', 'en', 'Apple Arcade', 'Hundreds of fun games with no ads or in-app purchases.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('APPLE-FITNESS-1M', 'ar', 'Apple Fitness+', 'تمارين متنوعة يقودها مدربون محترفون مع متابعة عبر أجهزة آبل.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('APPLE-FITNESS-1M', 'en', 'Apple Fitness+', 'Diverse workouts led by expert trainers with tracking on Apple devices.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('SURFSHARK-1M', 'ar', 'Surfshark VPN', 'تصفح آمن وخاص مع إمكانية فتح المواقع المحجوبة بسرعة عالية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('SURFSHARK-1M', 'en', 'Surfshark VPN', 'Secure and private browsing with fast access to blocked sites.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('EXPRESSVPN-1M', 'ar', 'ExpressVPN', 'سرعة فائقة وتصفح آمن مع أقوى تقنيات التشفير.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('EXPRESSVPN-1M', 'en', 'ExpressVPN', 'Blazing-fast speed and secure browsing with top encryption.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('HMA-VPN-1M', 'ar', 'HMA VPN', 'حرية التصفح مع شبكة خوادم واسعة وحماية قوية لبياناتك.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('HMA-VPN-1M', 'en', 'HMA VPN', 'Browse freely with a wide server network and strong data protection.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('PRIME-VIDEO-1M', 'ar', 'Prime Video', 'مكتبة ضخمة من الأفلام والمسلسلات مع إنتاجات أصلية حصرية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('PRIME-VIDEO-1M', 'en', 'Prime Video', 'A huge library of movies and series with exclusive originals.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('NETFLIX-1M', 'ar', 'Netflix', 'آلاف الأفلام والمسلسلات والعروض الوثائقية بجودة عالية وبدون إعلانات.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('NETFLIX-1M', 'en', 'Netflix', 'Thousands of movies, series, and documentaries in high quality, ad-free.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('CRUNCHYROLL-1M', 'ar', 'Crunchyroll', 'منصة الأنمي الأولى مع أحدث الحلقات والأنميات الكلاسيكية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('CRUNCHYROLL-1M', 'en', 'Crunchyroll', 'The top anime platform with the latest episodes and classic titles.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('IPTV-1M', 'ar', 'IPTV', 'قنوات مباشرة وأفلام ومسلسلات عبر الإنترنت بجودة عالية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('IPTV-1M', 'en', 'IPTV', 'Live channels, movies, and series online in high quality.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('TOD-TV-1M', 'ar', 'TOD TV', 'قنوات مباشرة وأفلام ومسلسلات مع تغطية حصرية للبطولات الرياضية.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('TOD-TV-1M', 'en', 'TOD TV', 'Live channels, movies, series, plus exclusive sports coverage.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('CHATGPT-PLUS-1M', 'ar', 'ChatGPT Plus', 'ذكاء اصطناعي أسرع وأكثر دقة مع وصول مميز حتى وقت الضغط.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('CHATGPT-PLUS-1M', 'en', 'ChatGPT Plus', 'Faster, more accurate AI with priority access during peak times.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('PERPLEXITY-PRO-1M', 'ar', 'Perplexity Pro', 'إجابات دقيقة وسريعة مدعومة بالذكاء الاصطناعي مع بحث عميق.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('PERPLEXITY-PRO-1M', 'en', 'Perplexity Pro', 'Fast, accurate AI-powered answers with deep source search.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('CANVA-PRO-1M', 'ar', 'Canva Pro', 'أدوات تصميم احترافية مع آلاف القوالب الجاهزة وعناصر مميزة.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('CANVA-PRO-1M', 'en', 'Canva Pro', 'Professional design tools with thousands of ready templates and premium assets.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('CAPCUT-PRO-1M', 'ar', 'CapCut Pro', 'أدوات مونتاج متقدمة مع مؤثرات وفلاتر احترافية للفيديو.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('CAPCUT-PRO-1M', 'en', 'CapCut Pro', 'Advanced video editing with professional effects and filters.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('SNAPCHAT-PLUS-1M', 'ar', 'Snapchat+', 'مزايا حصرية مثل تخصيص الأيقونات ومعرفة من أعاد مشاهدة قصصك.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('SNAPCHAT-PLUS-1M', 'en', 'Snapchat+', 'Exclusive perks like custom icons and story rewatch insights.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('XBOX-GAMEPASS-1M', 'ar', 'Xbox Game Pass', 'وصول غير محدود لمئات الألعاب على Xbox والكمبيوتر مع إضافات مستمرة.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('XBOX-GAMEPASS-1M', 'en', 'Xbox Game Pass', 'Unlimited access to hundreds of games on Xbox and PC with constant updates.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('SPOTIFY-PREMIUM-1M', 'ar', 'Spotify Premium', 'موسيقى غير محدودة بدون إعلانات مع إمكانية الاستماع أوفلاين.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('SPOTIFY-PREMIUM-1M', 'en', 'Spotify Premium', 'Unlimited ad-free music with offline listening.', 'Account details will be sent via email or WhatsApp within 24 hours.'),
    ('DEEZER-PREMIUM-1M', 'ar', 'Deezer Premium', 'استمع لملايين الأغاني بجودة عالية، مع تنزيل وتشغيل بدون إنترنت وبدون إعلانات.', 'سيتم إرسال بيانات الحساب عبر البريد الإلكتروني أو WhatsApp خلال 24 ساعة.'),
    ('DEEZER-PREMIUM-1M', 'en', 'Deezer Premium', 'Stream millions of songs in high quality, download for offline play, and enjoy music ad-free.', 'Account details will be sent via email or WhatsApp within 24 hours.')
) AS t(sku, language, name, description, activation_instructions)
WHERE p.sku = t.sku;

-- Insert Settings
INSERT INTO settings (key, value) VALUES 
  ('site_name', '{"en": "ATHMANEBZN STORE", "ar": "متجر عثمان بن"}'),
  ('exchange_rate_usd_to_dzd', '135'),
  ('tax_rate', '0'),
  ('payment_methods', '{"paypal": true, "crypto": true, "chargily": true}'),
  ('maintenance_mode', 'false'),
  ('contact_info', '{"whatsapp": "+213963547920", "telegram": "@atmnexe1", "email": "support@athmanebzn.com"}');

-- ==================== VERIFICATION ====================

SELECT 'Database setup completed successfully!' as status;
SELECT 'Categories:' as info, count(*) as count FROM categories
UNION ALL
SELECT 'Products:', count(*) FROM products
UNION ALL
SELECT 'Settings:', count(*) FROM settings;