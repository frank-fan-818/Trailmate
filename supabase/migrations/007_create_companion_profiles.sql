-- Trailmate 旅伴档案表
-- 每个用户只能有一条档案，关联 Supabase Auth 的 auth.users

CREATE TABLE IF NOT EXISTS companion_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    avatar          TEXT,
    bio             TEXT DEFAULT '',
    destination     VARCHAR(100) DEFAULT '',
    travel_days     INTEGER DEFAULT 0,
    departure_info  VARCHAR(100) DEFAULT '',
    departure_date  DATE,
    budget          VARCHAR(100) DEFAULT '',
    budget_type     VARCHAR(20) CHECK (budget_type IN ('budget', 'medium', 'luxury')),
    personality     VARCHAR(100) DEFAULT '',
    personality_type VARCHAR(20) CHECK (personality_type IN ('planner', 'spontaneous')),
    travel_types    TEXT[] DEFAULT '{}',
    wake_time       VARCHAR(5) DEFAULT '08:00',
    sleep_time      VARCHAR(5) DEFAULT '23:00',
    gender          VARCHAR(10) DEFAULT '保密' CHECK (gender IN ('男', '女', '保密')),
    age             INTEGER DEFAULT 0,
    is_visible      BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,
    credit_score    VARCHAR(10) DEFAULT '0',
    credit_level    VARCHAR(10) DEFAULT '白银' CHECK (credit_level IN ('钻石', '黄金', '白银')),
    credit_badge    VARCHAR(10) DEFAULT 'silver' CHECK (credit_badge IN ('diamond', 'gold', 'silver')),
    total_trips     INTEGER DEFAULT 0,
    rating          DECIMAL(3,1) DEFAULT 0.0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_companion_profiles_user_id ON companion_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_destination ON companion_profiles(destination);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_visible ON companion_profiles(is_visible);

ALTER TABLE companion_profiles ENABLE ROW LEVEL SECURITY;

-- 用户可读取所有可见的档案（用于匹配）
CREATE POLICY "Anyone can read visible profiles"
    ON companion_profiles FOR SELECT
    USING (is_visible = true OR auth.uid() = user_id);

-- 用户只能插入自己的档案
CREATE POLICY "Users can insert own profile"
    ON companion_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的档案
CREATE POLICY "Users can update own profile"
    ON companion_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- 用户只能删除自己的档案
CREATE POLICY "Users can delete own profile"
    ON companion_profiles FOR DELETE
    USING (auth.uid() = user_id);
