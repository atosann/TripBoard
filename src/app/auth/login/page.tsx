'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendSuccess(false);
    
    try {
      const supabase = createBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        setResendMessage('再送信に失敗しました: ' + resendError.message);
        setResendSuccess(false);
      } else {
        setResendMessage('確認メールを再送信しました。メールボックスをご確認ください。');
        setResendSuccess(true);
      }
    } catch (err) {
      setResendMessage('エラーが発生しました');
      setResendSuccess(false);
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendButton(false);
    setResendMessage('');
    setResendSuccess(false);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      console.log('ログイン試行:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        
        // メール未確認エラーの検知
        if (signInError.message.includes('Email not confirmed')) {
          setError('メールアドレスが未確認です。登録時に送信された確認メールのリンクをクリックしてください。');
          setShowResendButton(true);
          setLoading(false);
          return;
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
          setLoading(false);
          return;
        } else {
          setError(`ログインエラー: ${signInError.message}`);
          setLoading(false);
          return;
        }
      }

      if (data?.session) {
        console.log('ログイン成功:', data.user?.email);
        
        // profilesテーブルのデータを確認
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Profiles table error:', userError);
          setError('ユーザー情報の取得に失敗しました。管理者に連絡してください。');
          setLoading(false);
          return;
        }

        if (!userData) {
          console.error('User not found in profiles table');
          setError('ユーザー情報が見つかりません。新規登録からやり直してください。');
          setLoading(false);
          return;
        }

        console.log('User data found:', userData);
        
        // ログイン成功 - リダイレクト
        router.push('/main/top');
        router.refresh();
      } else {
        setError('ログインに失敗しました（セッションが作成されませんでした）');
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期しないエラーが発生しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-emerald-200">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center">
              みんなのメンバー募集掲示板
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            近場散策掲示板へようこそ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="flex-1">{error}</p>
                </div>
                
                {showResendButton && (
                  <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                    <p className="text-xs font-medium">📧 メールが届いていない場合:</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      className="w-full border-red-300 hover:bg-red-50"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {resendLoading ? '送信中...' : '確認メールを再送信'}
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      ※ 迷惑メールフォルダもご確認ください
                    </p>
                  </div>
                )}
              </div>
            )}

            {resendMessage && (
              <div className={`border p-3 rounded-md text-sm flex items-start gap-2 ${
                resendSuccess 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}>
                {resendSuccess ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <p>{resendMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoComplete="current-password"
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">アカウントをお持ちでない方は </span>
            <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium">
              新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}