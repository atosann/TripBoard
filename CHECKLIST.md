# ✅ セットアップチェックリスト

プロジェクトを実際に動かすための最終チェックリストです。

## 📋 デプロイ前チェック

### □ 1. 必要なアカウント作成
- [ ] Supabase アカウント作成
- [ ] Vercel アカウント作成
- [ ] GitHub アカウント作成（既存でOK）

### □ 2. ローカル環境構築
- [ ] Node.js 18以上インストール確認 (`node -v`)
- [ ] プロジェクトをダウンロード/クローン
- [ ] `npm install` 実行
- [ ] `.env.local` ファイル作成

### □ 3. Supabase設定
- [ ] プロジェクト作成（Tokyo リージョン推奨）
- [ ] `supabase/schema.sql` をSQL Editorで実行
- [ ] Email認証を有効化（Authentication → Providers）
- [ ] API Keyをメモ（Settings → API）
- [ ] Realtime有効化確認（Database → Replication）

### □ 4. 環境変数設定
`.env.local` に以下を設定：
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

### □ 5. ローカルテスト
- [ ] `npm run dev` で起動
- [ ] http://localhost:3000 にアクセス
- [ ] アカウント登録できるか確認
- [ ] 投稿作成できるか確認
- [ ] チャット動作確認

---

## 🚀 本番デプロイチェック

### □ 1. GitHub準備
- [ ] リポジトリ作成
- [ ] `.gitignore` 確認
- [ ] 初回コミット＆プッシュ

### □ 2. Vercelデプロイ
- [ ] Vercelにリポジトリをインポート
- [ ] 環境変数を全て設定
- [ ] デプロイ実行
- [ ] デプロイURLにアクセス確認

### □ 3. Supabase本番設定
- [ ] Site URLをVercel URLに変更
- [ ] Redirect URLs追加
  - `https://YOUR_APP.vercel.app/auth/callback`
- [ ] Email Templates確認（オプション）

### □ 4. 動作確認
- [ ] 本番環境でアカウント作成
- [ ] メール認証動作確認
- [ ] 投稿作成
- [ ] チャット送受信
- [ ] レスポンシブ確認（スマホ）

---

## 🔐 セキュリティチェック

### □ 環境変数
- [ ] `.env.local` は `.gitignore` に含まれている
- [ ] `service_role_key` はVercelの環境変数に設定（コミットしない）
- [ ] 本番と開発で異なるSupabaseプロジェクトを使う（推奨）

### □ Supabase設定
- [ ] RLSが全テーブルで有効
- [ ] 本番DBのパスワードが強固
- [ ] API Keyが外部に漏れていない

### □ アプリケーション
- [ ] スパムチェックが動作
- [ ] 通報機能が動作
- [ ] レート制限が設定されている（将来実装）

---

## 📊 運用準備チェック

### □ 管理者設定
- [ ] 自分を管理者に設定（SQL実行）
  ```sql
  UPDATE users SET is_admin = true WHERE id = 'YOUR_USER_ID';
  ```
- [ ] 管理画面にアクセス確認（将来実装）

### □ モニタリング
- [ ] Vercel Analytics確認
- [ ] Supabase Logs確認方法を把握
- [ ] エラー通知設定（オプション：Sentry）

### □ ドキュメント
- [ ] 利用規約を公開（`/terms`）
- [ ] プライバシーポリシーを公開（`/privacy`）
- [ ] ヘルプページ作成（オプション）

---

## 🎯 ローンチ準備

### □ コンテンツ準備
- [ ] 初回投稿を自分で作成（サンプル用）
- [ ] カテゴリが適切か確認
- [ ] 安全文言が表示されているか確認

### □ ユーザーテスト
- [ ] 友人に試してもらう
- [ ] フィードバック収集
- [ ] バグ修正

### □ 告知準備
- [ ] SNSアカウント作成（オプション）
- [ ] ランディングページ最適化
- [ ] OGP画像設定（オプション）

---

## 🔧 トラブル時の確認事項

### データベース関連
```sql
-- ユーザー数確認
SELECT COUNT(*) FROM users;

-- 投稿数確認
SELECT COUNT(*) FROM posts WHERE status = 'open';

-- エラーログ確認（Supabase Dashboard → Logs）
```

### Vercel関連
- ビルドログ確認（Vercel Dashboard → Deployments）
- 環境変数再確認（Settings → Environment Variables）
- 再デプロイ（Deployments → ⋯ → Redeploy）

---

## 📈 成長時の対応

### 100人達成時
- [ ] Supabase Pro検討（$25/月）
- [ ] 分析ツール導入（Google Analytics）
- [ ] フィードバックフォーム追加

### 1,000人達成時
- [ ] Redis導入（Upstash）
- [ ] CDN最適化（Cloudflare）
- [ ] React Nativeアプリ開発開始

---

## 🎉 ローンチ！

全てのチェックが完了したら、いよいよローンチです！

1. 最終動作確認
2. SNSで告知
3. フィードバック収集
4. 継続改善

頑張ってください！🚀
