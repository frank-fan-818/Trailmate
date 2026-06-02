-- Trailmate 实名认证表

CREATE TABLE IF NOT EXISTS real_name_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    real_name           VARCHAR(100) NOT NULL,
    id_number           VARCHAR(18) NOT NULL,
    id_card_front_url   TEXT,
    id_card_back_url    TEXT,
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id            UUID REFERENCES auth.users(id),
    admin_remark        TEXT,
    submitted_at        TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_real_name_verifications_user_id ON real_name_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_real_name_verifications_status ON real_name_verifications(status);

ALTER TABLE real_name_verifications ENABLE ROW LEVEL SECURITY;

-- 用户可查看自己的认证记录
CREATE POLICY "Users can read own verification"
    ON real_name_verifications FOR SELECT
    USING (auth.uid() = user_id);

-- 用户只能提交自己的认证
CREATE POLICY "Users can insert own verification"
    ON real_name_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可更新自己的认证（用于重新提交）
CREATE POLICY "Users can update own verification"
    ON real_name_verifications FOR UPDATE
    USING (auth.uid() = user_id);
