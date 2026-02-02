# 📝 .env.localファイルの作り方（完全ガイド）

## 📍 ファイルを作る場所

```
trip-board/              ← プロジェクトフォルダ
├── .env.local          ← ★ここに作る★（package.jsonと同じ階層）
├── .env.example        ← これが見本
├── package.json        ← これと同じ場所
├── next.config.js
├── README.md
├── src/                ← この中じゃない！
├── supabase/
└── public/
```

**重要**: `package.json`があるフォルダと同じ場所に作ってください！

---

## 🛠️ 作成方法（OS別）

### Windows

#### 方法1: .env.exampleをコピー（一番簡単！）
1. エクスプローラーで `trip-board` フォルダを開く
2. `.env.example` ファイルを見つける
   - 見えない場合：表示 → 「隠しファイル」にチェック
3. `.env.example` を右クリック → 「コピー」
4. 同じフォルダで右クリック → 「貼り付け」
5. 「.env.example のコピー」が作成される
6. ファイル名を `.env.local` に変更
   - ⚠️ 拡張子も含めて変更してください
   - 拡張子が見えない場合：表示 → 「ファイル名拡張子」にチェック

#### 方法2: 新規作成
1. `trip-board` フォルダで右クリック
2. 「新規作成」→「テキストドキュメント」
3. ファイル名を `.env.local` に変更
   - `.txt` は削除してください
4. 「拡張子を変更すると、ファイルが使えなくなる...」→「はい」

#### 方法3: コマンドプロンプト
```cmd
cd trip-board
type nul > .env.local
```

---

### Mac

#### 方法1: .env.exampleをコピー（一番簡単！）
1. Finderで `trip-board` フォルダを開く
2. `.env.example` ファイルを見つける
   - 見えない場合：Cmd + Shift + . （ドットキー）で表示
3. `.env.example` を右クリック → 「複製」
4. 複製されたファイル名を `.env.local` に変更

#### 方法2: テキストエディット
1. テキストエディットを開く
2. 「フォーマット」→「標準テキストにする」
3. 内容を入力（下記参照）
4. 保存場所を `trip-board` フォルダに指定
5. ファイル名を `.env.local` にして保存

#### 方法3: ターミナル
```bash
cd trip-board
touch .env.local
```

---

### VSCode（全OS共通・推奨！）

1. VSCodeで `trip-board` フォルダを開く
2. 左側のエクスプローラーで空白を右クリック
3. 「新しいファイル」をクリック
4. ファイル名に `.env.local` と入力してEnter
5. ファイルが作成され、自動的に開く

---

## ✍️ ファイルに書く内容

### ステップ1: 基本のテンプレートをコピー

`.env.local` ファイルに以下をコピー&ペーストしてください：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ステップ2: Supabaseから値を取得

#### 2-1. Supabaseにログイン
1. https://supabase.com を開く
2. ログイン
3. あなたのプロジェクト（trip-board等）をクリック

#### 2-2. API設定画面を開く
```
左メニュー「Settings」（⚙️）をクリック
  ↓
「API」をクリック
  ↓
以下の情報が表示される
```

#### 2-3. 値をコピーして貼り付け

画面に表示される情報：

```
┌─────────────────────────────────────┐
│ Project URL                         │
│ https://xxxxx.supabase.co          │ ← これをコピー
└─────────────────────────────────────┘
  ↓ .env.localの NEXT_PUBLIC_SUPABASE_URL に貼り付け

┌─────────────────────────────────────┐
│ API Keys                            │
│                                     │
│ anon public                         │
│ eyJhbGci...                         │ ← これをコピー
└─────────────────────────────────────┘
  ↓ .env.localの NEXT_PUBLIC_SUPABASE_ANON_KEY に貼り付け

┌─────────────────────────────────────┐
│ service_role                        │
│ 🔒 Secret                           │
│ [Reveal] をクリック                  │
│ eyJhbGci...                         │ ← これをコピー
└─────────────────────────────────────┘
  ↓ .env.localの SUPABASE_SERVICE_ROLE_KEY に貼り付け
```

⚠️ **service_role**は「Reveal」ボタンを押さないと表示されません！

---

## 🎯 完成例

正しく設定された `.env.local` の例：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE5MzE3Mzc2MTZ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### チェックポイント ✅
- [ ] `=` の前後にスペースなし
- [ ] 各行の最後に余計な文字なし
- [ ] URLは `https://` から始まる
- [ ] キーは `eyJ` から始まる長い文字列
- [ ] 最後の行（APP_URL）は `http://localhost:3000`

---

## 🔍 確認方法

### 正しく作成されたか確認

#### VSCodeで確認
1. VSCodeで `trip-board` フォルダを開く
2. 左側のファイル一覧に `.env.local` が表示される
3. クリックして開く → 内容が表示される

#### ターミナルで確認（Mac/Linux）
```bash
cd trip-board
ls -la | grep .env
```

以下が表示されればOK：
```
.env.example
.env.local
```

#### コマンドプロンプトで確認（Windows）
```cmd
cd trip-board
dir /a | findstr .env
```

---

## ⚠️ よくある間違い

### ❌ 間違った場所
```
trip-board/
└── src/
    └── .env.local    ← ダメ！srcの中じゃない
```

### ❌ 間違ったファイル名
```
.env.local.txt        ← .txtは不要
env.local             ← 最初のドットが必要
.env                  ← localが必要
```

### ❌ 間違った内容
```env
NEXT_PUBLIC_SUPABASE_URL = https://...    ← スペース不要
NEXT_PUBLIC_SUPABASE_URL="https://..."    ← 引用符不要
```

### ✅ 正しい内容
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

---

## 🐛 トラブルシューティング

### Q: `.env.local` が見えない
**A**: 隠しファイルになっています。
- Windows: エクスプローラー → 表示 → 「隠しファイル」にチェック
- Mac: Finder で Cmd + Shift + . （ドットキー）

### Q: エラー「Invalid API key」
**A**: 
1. Supabaseから正しくコピーできているか確認
2. 余計なスペースや改行が入っていないか確認
3. 引用符（"）で囲んでいないか確認

### Q: アプリが動かない
**A**:
1. `.env.local` の場所が正しいか確認（package.jsonと同じ階層）
2. 開発サーバーを再起動: `Ctrl+C` → `npm run dev`
3. ファイル名が正確に `.env.local` になっているか確認

### Q: VSCodeで `.env.local` が見えない
**A**: ファイルを保存していない可能性があります。Ctrl+S（Cmd+S）で保存してください。

---

## ✅ 完了チェックリスト

設定が完了したら確認：

- [ ] `.env.local` ファイルが `trip-board` フォルダ直下に存在する
- [ ] `package.json` と同じ階層にある
- [ ] ファイル名が正確に `.env.local`（拡張子なし）
- [ ] 4つの環境変数が全て設定されている
- [ ] Supabaseから正しい値をコピーした
- [ ] `=` の前後にスペースがない
- [ ] service_role_keyは「Reveal」を押してコピーした
- [ ] ファイルを保存した

**全てチェックできたら完了です！次は `npm run dev` でアプリを起動しましょう！**

---

## 🎉 次のステップ

`.env.local` の設定が完了したら：

1. ターミナルを開く
2. `cd trip-board` でフォルダに移動
3. `npm run dev` で開発サーバー起動
4. ブラウザで http://localhost:3000 を開く

これで Trip Board が動きます！🚀
