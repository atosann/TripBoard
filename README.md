# 近場散策掲示板 - Trip Board

日帰り・近場散策（神社巡り、街歩き、カフェ散策）特化型の掲示板SNS

## 🎯 コンセプト
- 場所・日時を投稿して参加者を募集
- 自動グループチャット生成
- 匿名寄りのUX（性別非表示）
- 全国対応

## 🛠 技術スタック（完全無料スタート可能）

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui

### バックエンド
- Next.js API Routes
- Supabase (Postgres + Auth + Realtime)

### 地図
- React Leaflet + OpenStreetMap（無料）

### デプロイ
- Vercel（フロント + API）
- Supabase（DB + 認証）

## 📦 セットアップ

### 1. 依存関係インストール
```bash
npm install
```

### 2. 環境変数設定
`.env.local` を作成：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseセットアップ
1. https://supabase.com でプロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. Authenticationで Email認証を有効化

### 4. 開発サーバー起動
```bash
npm run dev
```

## 🚀 デプロイ

### Vercelへデプロイ
```bash
vercel
```

環境変数をVercelダッシュボードで設定してください。

## 📁 プロジェクト構造

```
trip-board/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── (main)/            # メインアプリ
│   │   ├── admin/             # 管理画面
│   │   └── api/               # API Routes
│   ├── components/            # Reactコンポーネント
│   ├── lib/                   # ユーティリティ
│   └── types/                 # TypeScript型定義
├── supabase/
│   ├── schema.sql             # DBスキーマ
│   └── migrations/            # マイグレーション
└── public/                    # 静的ファイル
```

## 🔐 セキュリティ機能

- メール認証必須
- 投稿・参加のレート制限
- 通報機能
- 自動スパム検知
- 座標のぼかし表示（±500m）
- Row Level Security（RLS）

## 📈 将来のアップグレード

- SMS認証追加（Twilio）
- React Nativeアプリ化
- プッシュ通知
- 画像アップロード（Supabase Storage）
- Redis導入（キャッシュ・レート制限強化）

## 📄 ライセンス

MIT
