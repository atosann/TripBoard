# 🚀 デプロイ手順書

完全無料で始められる構成でのデプロイ方法です。

## 📋 必要なアカウント

1. **Supabase** (無料): https://supabase.com
2. **Vercel** (無料): https://vercel.com
3. **GitHub** (無料): https://github.com

---

## ステップ1: Supabaseのセットアップ

### 1-1. プロジェクト作成
1. Supabaseにログイン
2. "New Project" をクリック
3. プロジェクト名: `trip-board`
4. データベースパスワードを設定（保存しておく）
5. リージョン: `Northeast Asia (Tokyo)` を選択
6. "Create new project" をクリック

### 1-2. データベース初期化
1. 左メニュー → "SQL Editor"
2. "New query" をクリック
3. `supabase/schema.sql` の内容を全てコピペ
4. "Run" をクリックして実行

### 1-3. 認証設定
1. 左メニュー → "Authentication" → "Providers"
2. "Email" が有効になっていることを確認
3. "Email Confirmations" を **無効化**（テスト用、本番では有効化推奨）

### 1-4. API キーを取得
1. 左メニュー → "Settings" → "API"
2. 以下をメモ：
   - `Project URL`
   - `anon public` key
   - `service_role` key（秘密にする）

---

## ステップ2: GitHubリポジトリ作成

### 2-1. ローカルで初期化
```bash
cd trip-board
git init
git add .
git commit -m "Initial commit"
```

### 2-2. GitHubにプッシュ
1. GitHub.comで新規リポジトリ作成（`trip-board`）
2. ローカルでリモート追加：
```bash
git remote add origin https://github.com/YOUR_USERNAME/trip-board.git
git branch -M main
git push -u origin main
```

---

## ステップ3: Vercelへデプロイ

### 3-1. Vercelにインポート
1. Vercelにログイン
2. "Add New" → "Project"
3. GitHubリポジトリ `trip-board` をインポート
4. Framework Preset: **Next.js** が自動選択される
5. まだ **Deploy しない**

### 3-2. 環境変数を設定
"Environment Variables" セクションで以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL = <SupabaseのProject URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <Supabaseのanon public key>
SUPABASE_SERVICE_ROLE_KEY = <Supabaseのservice_role key>
NEXT_PUBLIC_APP_URL = https://YOUR_APP_NAME.vercel.app
```

※ `NEXT_PUBLIC_APP_URL` は後で実際のURLに変更

### 3-3. デプロイ
1. "Deploy" をクリック
2. 数分待つとデプロイ完了
3. 割り当てられたURL（例: `trip-board-xyz.vercel.app`）にアクセス

### 3-4. URLを修正
1. デプロイ後、実際のURLをコピー
2. Vercel → Settings → Environment Variables
3. `NEXT_PUBLIC_APP_URL` を実際のURLに変更
4. 再デプロイ（Deployments → 最新のデプロイ → ⋯ → Redeploy）

---

## ステップ4: Supabaseの最終設定

### 4-1. Redirect URL設定
1. Supabase → Authentication → URL Configuration
2. "Site URL" に Vercel の URL を設定
3. "Redirect URLs" に以下を追加：
   ```
   https://YOUR_APP_NAME.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

---

## ステップ5: 動作確認

### 5-1. アカウント作成テスト
1. デプロイしたURLにアクセス
2. "新規登録" からアカウント作成
3. メール確認（確認無効化した場合は自動ログイン）

### 5-2. 投稿テスト
1. ログイン後、投稿作成
2. 位置情報入力（東京駅など）
3. 投稿が一覧に表示されることを確認

### 5-3. チャットテスト
1. 別のアカウントで投稿に参加
2. チャットでメッセージ送信
3. リアルタイム反映を確認

---

## 🔧 トラブルシューティング

### エラー: "Invalid API key"
→ Vercelの環境変数を確認。再デプロイ。

### エラー: "Failed to fetch"
→ SupabaseのRLSポリシーを確認。`schema.sql`を再実行。

### チャットが動かない
→ Supabase → Database → Replication
→ `messages`, `participants`, `posts` テーブルの Realtime が有効か確認

### 投稿が表示されない
→ Supabase → Table Editor → `posts` テーブルを確認
→ `is_hidden = false`, `status = 'open'` になっているか

---

## 📊 無料枠の制限

### Supabase無料枠
- DB容量: 500MB
- 月間リクエスト: 無制限（通常利用では問題なし）
- Realtime接続: 200同時接続
- ストレージ: 1GB（画像機能追加時）

### Vercel無料枠
- 月間ビルド時間: 6000分
- 帯域幅: 100GB/月
- 関数実行時間: 100時間/月

**→ 初期は十分すぎる容量です！**

---

## 🚀 スケールアップ時の対応

### ユーザーが増えてきたら（100人以上）
1. Supabase Pro プラン ($25/月)
   - DB容量 8GB
   - 無制限Realtime接続
2. Vercel Pro プラン ($20/月)
   - より多くのビルド時間
   - 優先サポート

### さらに成長したら（1000人以上）
1. Redis追加（Upstash無料枠）
2. CDN設定（Cloudflare無料枠）
3. 画像最適化（Cloudinary無料枠）

---

## 📝 次のステップ

デプロイ完了後、以下を実装推奨：

1. **管理者アカウント作成**
   ```sql
   -- Supabase SQL Editor で実行
   UPDATE users SET is_admin = true WHERE id = 'YOUR_USER_ID';
   ```

2. **Google Analytics追加**（無料）
3. **Sentry導入**（エラー監視、無料枠あり）
4. **カスタムドメイン設定**（Vercel無料で可能）

---

これで完全無料でサービスを開始できます！🎉
