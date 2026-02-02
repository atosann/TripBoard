# 🚀 クイックスタートガイド

## ローカル開発を5分で始める

### 前提条件
- Node.js 18以上
- npm または yarn

### ステップ1: 依存関係インストール
```bash
npm install
```

### ステップ2: Supabaseプロジェクト作成
1. https://supabase.com でアカウント作成
2. "New Project" から新規プロジェクト作成
3. プロジェクト名: `trip-board-dev`
4. リージョン: Tokyo
5. データベースパスワードを設定

### ステップ3: データベース初期化
1. Supabase → SQL Editor
2. `supabase/schema.sql` の内容をコピペして実行

### ステップ4: 環境変数設定
`.env.local` ファイルを作成：
```bash
cp .env.example .env.local
```

以下の値を入力（Supabase → Settings → API で確認）：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ステップ5: 開発サーバー起動
```bash
npm run dev
```

→ http://localhost:3000 にアクセス

### ステップ6: 動作確認
1. "新規登録" からアカウント作成
2. 投稿を作成
3. チャットを試す

---

## 🎨 フロントエンド開発

### 主要コンポーネント
```
src/components/
├── ui/              # 基本UIコンポーネント（Button, Cardなど）
├── posts/           # 投稿関連
│   └── PostCard.tsx
├── chat/            # チャット関連
│   └── ChatBox.tsx
└── auth/            # 認証関連
```

### 新しいページ追加
```typescript
// src/app/example/page.tsx
export default function ExamplePage() {
  return <div>新しいページ</div>;
}
```

### 新しいAPIエンドポイント追加
```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```

---

## 🗄️ データベース操作

### Supabaseクライアント使用例
```typescript
import { createBrowserClient } from '@/lib/supabase';

const supabase = createBrowserClient();

// データ取得
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'open');

// データ挿入
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Test' });
```

### マイグレーション
新しいテーブルを追加する場合：
```sql
-- supabase/migrations/001_add_feature.sql
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

---

## 🧪 テストユーザー作成

管理者権限付与：
```sql
-- Supabase SQL Editorで実行
UPDATE users 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID';
```

複数アカウントでテスト：
1. シークレットウィンドウで別アカウント作成
2. 投稿に参加してチャットをテスト

---

## 📦 よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# ビルド
npm run build

# 本番環境で起動
npm run start

# リント
npm run lint
```

---

## 🐛 トラブルシューティング

### "Module not found" エラー
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase接続エラー
1. `.env.local` の値を確認
2. Supabaseプロジェクトが起動しているか確認
3. RLSポリシーを再確認

### Realtime動かない
Supabase → Database → Replication で該当テーブルを有効化

---

## 🚀 次に実装する機能候補

### 優先度高
1. 位置情報検索（Geolocation API）
2. 画像アップロード（Supabase Storage）
3. プッシュ通知（Web Push API）
4. プロフィール編集画面

### 優先度中
1. カテゴリフィルター
2. 日付範囲検索
3. お気に入り機能
4. レビュー・評価システム

### 優先度低（スケール後）
1. SMS認証
2. React Nativeアプリ化
3. 管理者ダッシュボード
4. 分析・統計機能

---

## 📚 参考リンク

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)

---

これで開発を始められます！🎉
質問があれば README.md や各ファイルのコメントを参照してください。
