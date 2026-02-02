'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function MinimalTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testEnvironment = () => {
    setLogs([]);
    addLog('=== 環境変数チェック ===');
    addLog(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設定'}`);
    addLog(`Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}`);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      addLog('❌ 環境変数が設定されていません！');
      addLog('→ .env.localファイルを作成してください');
      addLog('→ 開発サーバーを再起動してください');
    } else {
      addLog('✅ 環境変数は正しく設定されています');
    }
  };

  const testConnection = async () => {
    addLog('=== 接続テスト ===');
    try {
      addLog('Supabaseクライアント作成中...');
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      addLog('✅ クライアント作成成功');
      addLog('セッション取得中...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`❌ エラー: ${error.message}`);
      } else {
        addLog('✅ Supabase接続成功！');
        addLog(`セッション: ${data.session ? 'あり' : 'なし'}`);
      }
    } catch (err: any) {
      addLog(`💥 例外発生: ${err.message}`);
      addLog(`詳細: ${err.toString()}`);
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      addLog('❌ メールアドレスとパスワードを入力してください');
      return;
    }

    addLog('=== ログインテスト ===');
    addLog(`Email: ${email}`);
    
    try {
      addLog('Supabaseクライアント作成中...');
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      addLog('✅ クライアント作成成功');
      addLog('ログインリクエスト送信中...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) {
        addLog(`❌ ログイン失敗: ${error.message}`);
        addLog(`エラーコード: ${error.status}`);
      } else if (data.session) {
        addLog('✅ ログイン成功！');
        addLog(`User ID: ${data.user?.id}`);
        addLog(`Email: ${data.user?.email}`);
        addLog(`セッション有効期限: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);
      } else {
        addLog('❌ セッションが作成されませんでした');
      }
    } catch (err: any) {
      addLog(`💥 例外発生: ${err.message}`);
      addLog(`詳細: ${err.toString()}`);
    }
  };

  const testRegister = async () => {
    if (!email || !password) {
      addLog('❌ メールアドレスとパスワードを入力してください');
      return;
    }

    addLog('=== 新規登録テスト ===');
    addLog(`Email: ${email}`);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      addLog('新規登録リクエスト送信中...');
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      
      if (error) {
        addLog(`❌ 登録失敗: ${error.message}`);
      } else if (data.user) {
        addLog('✅ 登録成功！');
        addLog(`User ID: ${data.user.id}`);
        addLog(`Email: ${data.user.email}`);
      }
    } catch (err: any) {
      addLog(`💥 例外発生: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Supabase診断ツール（最小版）</h1>

        {/* テストボタン */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ステップ1: 環境変数チェック</h2>
          <button
            onClick={testEnvironment}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            環境変数をチェック
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ステップ2: 接続テスト</h2>
          <button
            onClick={testConnection}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Supabase接続をテスト
          </button>
        </div>

        {/* ログイン/登録テスト */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ステップ3: ログイン/登録テスト</h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testRegister}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              新規登録テスト
            </button>
            <button
              onClick={testLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              ログインテスト
            </button>
          </div>
        </div>

        {/* ログ表示 */}
        <div className="bg-gray-900 text-green-400 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">実行ログ</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              クリア
            </button>
          </div>
          
          <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">上のボタンをクリックしてテストを開始してください</div>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* 使い方 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">📝 使い方</h3>
          <ol className="space-y-1 text-sm">
            <li>1. まず「環境変数をチェック」をクリック</li>
            <li>2. 次に「Supabase接続をテスト」をクリック</li>
            <li>3. メールとパスワードを入力</li>
            <li>4. 「新規登録テスト」または「ログインテスト」をクリック</li>
            <li>5. ログを確認してエラーがないかチェック</li>
          </ol>
        </div>
      </div>
    </div>
  );
}