/*
  # إضافة قيود منع التكرار للإيميل واليوزرنايم
  
  1. التغييرات
    - إنشاء جدول user_profiles لحفظ اليوزرنايم
    - إضافة قيد unique على username
    - إضافة trigger لمنع التكرار
    - إضافة RLS policies
  
  2. الأمان
    - RLS على جدول user_profiles
    - منع التكرار على مستوى قاعدة البيانات
*/

-- إنشاء جدول user_profiles لحفظ معلومات إضافية
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS على الجدول
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء policies للـ user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user_profiles"
  ON user_profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- إنشاء function للتحقق من اليوزرنايم
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من وجود اليوزرنايم
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$;

-- إنشاء function للتحقق من الإيميل
CREATE OR REPLACE FUNCTION check_email_availability(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من وجود الإيميل في auth.users
  RETURN NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$;

-- إنشاء trigger function لإنشاء profile تلقائياً
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (user_id, username, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتشغيل الـ function عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

SELECT 'تم إضافة قيود منع التكرار بنجاح!' as status;