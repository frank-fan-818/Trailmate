-- Trailmate 用户信息表
-- 关联 Supabase Auth 的 auth.users 表，存储用户可编辑的公开信息

CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    avatar      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户可读取自己的信息
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- 用户注册时可创建自己的档案
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 用户可修改自己的档案
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

COMMENT ON TABLE profiles IS '用户档案表，关联 Supabase Auth 的 auth.users';
COMMENT ON COLUMN profiles.name IS '用户显示名称';
COMMENT ON COLUMN profiles.avatar IS '头像 URL';
