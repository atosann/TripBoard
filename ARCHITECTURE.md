# 🏗️ システムアーキテクチャ

## 📐 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                         ユーザー                              │
│                    (Browser / Mobile Web)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Edge Network)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 App Router                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Frontend   │  │  API Routes  │  │  Middleware │ │ │
│  │  │  (React 18)  │  │   (Server)   │  │    (Auth)   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   PostgreSQL 15                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │  users   │ │  posts   │ │messages  │ │ reports  │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │                + RLS (Row Level Security)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Supabase Auth (認証)                      │ │
│  │  • Email/Password認証                                  │ │
│  │  • JWT トークン管理                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Supabase Realtime (リアルタイム)             │ │
│  │  • PostgreSQL Change Data Capture                     │ │
│  │  • WebSocket接続                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 データフロー

### 1. 投稿作成フロー
```
User Input (投稿フォーム)
    ↓
Frontend Validation (スパムチェック)
    ↓
POST /api/posts
    ↓
Server Side Validation
    ↓
座標ぼかし処理 (Trigger)
    ↓
Supabase Insert
    ↓
自動参加 (participants テーブル)
    ↓
アクティビティログ記録
    ↓
Response → 投稿詳細ページへリダイレクト
```

### 2. チャットメッセージフロー
```
User Input (メッセージ送信)
    ↓
POST /api/posts/[id]/messages
    ↓
参加者確認 (participants テーブル)
    ↓
スパムチェック
    ↓
Supabase Insert
    ↓
Realtime Broadcast (WebSocket)
    ↓
全参加者のブラウザに即座に反映
```

### 3. 通報処理フロー
```
User Action (通報ボタン)
    ↓
POST /api/reports
    ↓
重複通報チェック (24時間以内)
    ↓
Supabase Insert (reports テーブル)
    ↓
対象を一時非表示 (is_hidden = true)
    ↓
管理者に通知 (メール or Slack)
    ↓
管理者レビュー
    ↓
アカウント凍結 or 警告 or 却下
```

---

## 🗄️ データベース設計

### ER図（簡略版）
```
┌─────────────┐         ┌─────────────┐
│    users    │←────────│    posts    │
│ ─────────── │  作成   │ ─────────── │
│ id (PK)     │         │ id (PK)     │
│ display_name│         │ author_id   │
│ trust_score │         │ title       │
│ is_admin    │         │ location    │
└─────────────┘         │ event_date  │
       ↑                └─────────────┘
       │                       ↑
       │                       │
       │                       │ 参加
       │                ┌──────────────┐
       │                │ participants │
       └────────────────│ ──────────── │
          参加者        │ post_id (FK) │
                        │ user_id (FK) │
                        │ status       │
                        └──────────────┘
                               ↑
                               │
                               │ メッセージ送信
                        ┌──────────────┐
                        │  messages    │
                        │ ──────────── │
                        │ id (PK)      │
                        │ post_id (FK) │
                        │ user_id (FK) │
                        │ content      │
                        └──────────────┘
```

### 主要テーブル一覧
| テーブル名 | 説明 | 重要フィールド |
|----------|------|--------------|
| users | ユーザー情報 | display_name, trust_score, is_admin |
| posts | 投稿 | location, event_date, status |
| participants | 参加者管理 | post_id, user_id, status |
| messages | チャット | post_id, user_id, content |
| reports | 通報 | target_type, target_id, status |
| categories | カテゴリマスター | name, icon |

---

## 🔐 セキュリティ設計

### 認証・認可
```
Level 1: Supabase Auth (JWT)
    ↓
Level 2: Row Level Security (RLS)
    • ユーザーは自分の投稿のみ編集可能
    • 参加者のみチャット閲覧・送信可能
    ↓
Level 3: API レート制限
    • 投稿: 5件/時間
    • メッセージ: 30件/分
    ↓
Level 4: 入力バリデーション
    • スパムキーワード検知
    • URL過多チェック
    • 文字数制限
```

### RLS ポリシー例
```sql
-- 投稿: 非表示でなければ誰でも閲覧可能
CREATE POLICY "Posts viewable by everyone" 
ON posts FOR SELECT 
USING (NOT is_hidden OR auth.uid() = author_id);

-- メッセージ: 参加者のみ閲覧可能
CREATE POLICY "Messages viewable by participants" 
ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM participants 
    WHERE post_id = messages.post_id 
    AND user_id = auth.uid() 
    AND status = 'joined'
  )
);
```

---

## ⚡ パフォーマンス最適化

### データベースインデックス
```sql
-- 投稿検索の高速化
CREATE INDEX idx_posts_event_date ON posts(event_date);
CREATE INDEX idx_posts_location ON posts(latitude, longitude);
CREATE INDEX idx_posts_status ON posts(status);

-- メッセージ取得の高速化
CREATE INDEX idx_messages_post ON messages(post_id, created_at DESC);
```

### キャッシュ戦略（将来実装）
```
Browser Cache
    ↓
CDN Cache (Vercel Edge)
    ↓
Redis Cache (オプション、1000人超えたら)
    ↓
Supabase Query
```

---

## 📊 スケーラビリティ

### 現在の構成で対応可能なユーザー数
- **0〜100人**: 完全無料プランで快適
- **100〜1,000人**: Supabase Pro ($25/月) で対応可能
- **1,000〜10,000人**: Redis追加 + Vercel Pro
- **10,000人以上**: マイクロサービス化を検討

### ボトルネック予測と対策
| ボトルネック | 対策 |
|------------|------|
| DB接続数 | Connection Pooling (Supavisor) |
| Realtime接続 | Redis Pub/Sub へ移行 |
| 画像容量 | Cloudinary / Imgix 導入 |
| API レート | Redis Rate Limiter |

---

## 🔄 CI/CD パイプライン（将来実装）

```
GitHub Push (main branch)
    ↓
GitHub Actions
    ↓
┌─────────────────────────┐
│  1. Type Check          │
│  2. Lint                │
│  3. Unit Test           │
└─────────────────────────┘
    ↓
Vercel Auto Deploy
    ↓
Production Environment
    ↓
Sentry (エラー監視)
```

---

## 🛠️ 技術スタック詳細

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5
- **UI**: Tailwind CSS + shadcn/ui
- **状態管理**: React Hooks (useState, useEffect)
- **地図**: React Leaflet + OpenStreetMap

### バックエンド
- **API**: Next.js API Routes
- **データベース**: PostgreSQL 15 (Supabase)
- **認証**: Supabase Auth (JWT)
- **リアルタイム**: Supabase Realtime (WebSocket)

### インフラ
- **ホスティング**: Vercel (Edge Network)
- **DB/Auth**: Supabase (AWS Tokyo Region)
- **DNS**: Vercel DNS or Cloudflare
- **監視**: Vercel Analytics (無料枠)

### 開発ツール
- **バージョン管理**: Git + GitHub
- **パッケージ管理**: npm
- **コード品質**: ESLint + TypeScript

---

## 🚀 アップグレードパス

### Phase 1: MVP（現在）
- 投稿・参加・チャット
- 基本的な通報機能
- メール認証

### Phase 2: 機能拡張（100人超）
- 画像アップロード
- プッシュ通知
- SMS認証
- 詳細検索・フィルター

### Phase 3: アプリ化（1,000人超）
- React Native アプリ
- プッシュ通知（FCM）
- オフライン対応
- 位置情報バックグラウンド取得

### Phase 4: エンタープライズ（10,000人超）
- マイクロサービス化
- Kubernetes導入
- Redis Cluster
- ElasticSearch（全文検索）

---

この設計書に基づいて開発・運用してください！
