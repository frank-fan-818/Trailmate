-- Trailmate Storage Bucket 配置
-- 在 Supabase SQL Editor 中执行此脚本即可创建存储桶和权限策略

-- ============================================
-- 1. 创建 avatars 存储桶（公开读取）
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,           -- 公开访问
    5242880,        -- 最大 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- avatars 桶：任何人都可以读取（公开桶）
CREATE POLICY "avatars_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- avatars 桶：认证用户可以上传
CREATE POLICY "avatars_auth_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );

-- avatars 桶：用户只能删除自己上传的文件
CREATE POLICY "avatars_owner_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid() = owner
    );

-- ============================================
-- 2. 创建 id-cards 存储桶（私有，仅文件所有者可访问）
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'id-cards',
    'id-cards',
    false,          -- 私有访问
    5242880,        -- 最大 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- id-cards 桶：只有文件所有者可以读取
CREATE POLICY "id_cards_owner_read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'id-cards'
        AND auth.uid() = owner
    );

-- id-cards 桶：认证用户可以上传
CREATE POLICY "id_cards_auth_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'id-cards'
        AND auth.role() = 'authenticated'
    );

-- id-cards 桶：只有所有者可以删除
CREATE POLICY "id_cards_owner_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'id-cards'
        AND auth.uid() = owner
    );
