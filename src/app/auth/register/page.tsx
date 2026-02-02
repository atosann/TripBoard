'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEmail, validatePassword } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!validateEmail(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (!formData.displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています');
        } else {
          setError('登録に失敗しました: ' + signUpError.message);
        }
        setLoading(false);
        return;
      }

      // 登録成功
      alert('登録が完了しました！ログインページに移動します。');
      router.push('/auth/login');
    } catch (err) {
      setError('登録処理中にエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">新規登録</CardTitle>
          <CardDescription className="text-center">
            アカウントを作成して始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                表示名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="山田太郎"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="もう一度入力"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              <p className="font-medium mb-1">⚠️ ご利用前に必ずご確認ください</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>18歳以上の方のみご利用いただけます</li>
                <li>実際の集合は公共の場で行ってください</li>
                <li>個人情報は絶対に公開しないでください</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登録中...' : '新規登録'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">既にアカウントをお持ちの方は </span>
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              ログイン
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            登録することで、
            <Link href="/terms" className="underline">利用規約</Link>
            および
            <Link href="/privacy" className="underline">プライバシーポリシー</Link>
            に同意したものとみなされます。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}