-- ==========================================
-- Trip Board データベーススキーマ
-- ==========================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. users テーブル（ユーザー情報）
-- ==========================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  bio TEXT,
  area VARCHAR(100), -- 居住エリア（市区町村レベル）
  trust_score INTEGER DEFAULT 100, -- 信頼度スコア
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー作成時の自動挿入トリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'ユーザー' || SUBSTRING(NEW.id::TEXT, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. categories テーブル（カテゴリマスター）
-- ==========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50), -- 絵文字またはアイコン名
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期カテゴリデータ
INSERT INTO public.categories (name, icon, description) VALUES
  ('神社仏閣巡り', '⛩️', '神社やお寺を巡る散策'),
  ('街歩き', '🏙️', '街の風景を楽しむ散策'),
  ('カフェ巡り', '☕', 'カフェやグルメスポット巡り'),
  ('自然散策', '🌳', '公園や自然の中での散策'),
  ('美術館・博物館', '🎨', '文化施設めぐり'),
  ('ショッピング', '🛍️', 'ショッピングエリア散策'),
  ('その他', '📍', 'その他の散策');

-- ==========================================
-- 3. posts テーブル（投稿）
-- ==========================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location_name VARCHAR(200) NOT NULL, -- 集合場所名（例：東京駅丸の内口）
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  blurred_latitude DECIMAL(10, 8), -- ぼかした緯度（±500m）
  blurred_longitude DECIMAL(11, 8), -- ぼかした経度
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  is_hidden BOOLEAN DEFAULT false, -- 通報による一時非表示
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座標ぼかし処理トリガー
CREATE OR REPLACE FUNCTION blur_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- ±0.005度（約500m）のランダムなぼかし
  NEW.blurred_latitude = NEW.latitude + (RANDOM() * 0.01 - 0.005);
  NEW.blurred_longitude = NEW.longitude + (RANDOM() * 0.01 - 0.005);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blur_post_coordinates
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION blur_coordinates();

-- ==========================================
-- 4. participants テーブル（参加者管理）
-- ==========================================
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'kicked')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 投稿作成時に自動参加させるトリガー
CREATE OR REPLACE FUNCTION auto_join_creator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.participants (post_id, user_id, status)
  VALUES (NEW.id, NEW.author_id, 'joined');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION auto_join_creator();

-- ==========================================
-- 5. messages テーブル（チャットメッセージ）
-- ==========================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false, -- システムメッセージ（参加通知等）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. reports テーブル（通報）
-- ==========================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'message', 'user')),
  target_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 7. activity_logs テーブル（アクティビティログ）
-- ==========================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(20),
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- インデックス作成
-- ==========================================
CREATE INDEX idx_posts_event_date ON public.posts(event_date) WHERE status = 'open';
CREATE INDEX idx_posts_location ON public.posts(blurred_latitude, blurred_longitude);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category_id);
CREATE INDEX idx_messages_post ON public.messages(post_id, created_at DESC);
CREATE INDEX idx_participants_post ON public.participants(post_id) WHERE status = 'joined';
CREATE INDEX idx_participants_user ON public.participants(user_id);
CREATE INDEX idx_reports_status ON public.reports(status) WHERE status = 'pending';

-- ==========================================
-- Row Level Security (RLS) ポリシー
-- ==========================================

-- users テーブル
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users viewable by everyone"
  ON public.users FOR SELECT
  USING (NOT is_banned);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- posts テーブル
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by everyone"
  ON public.posts FOR SELECT
  USING (NOT is_hidden OR auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- participants テーブル
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by post participants"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants AS p
      WHERE p.post_id = participants.post_id
      AND p.user_id = auth.uid()
      AND p.status = 'joined'
    )
  );

CREATE POLICY "Users can join posts"
  ON public.participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave posts"
  ON public.participants FOR UPDATE
  USING (auth.uid() = user_id);

-- messages テーブル
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by participants"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE post_id = messages.post_id
      AND user_id = auth.uid()
      AND status = 'joined'
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.participants
      WHERE post_id = messages.post_id
      AND user_id = auth.uid()
      AND status = 'joined'
    )
  );

-- reports テーブル
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- categories テーブル（全員閲覧可能）
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- activity_logs テーブル（管理者のみ）
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- ==========================================
-- Realtimeを有効化
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- ==========================================
-- 完了
-- ==========================================
