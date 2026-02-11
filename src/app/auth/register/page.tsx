'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEmail, validatePassword } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: アカウント情報, 2: プロフィール情報
  const [formData, setFormData] = useState({
    // アカウント情報
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    // プロフィール情報
    ageRange: '',
    gender: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setError('');

    // ステップ1のバリデーション
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

    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ステップ2のバリデーション
    if (!formData.ageRange) {
      setError('年齢層を選択してください');
      return;
    }

    if (!formData.gender) {
      setError('性別を選択してください');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      // ユーザー登録（メール確認なし）
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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

      // プロフィール情報を更新（upsertに変更）
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            display_name: formData.displayName,
            age_range: formData.ageRange,
            gender: formData.gender,
            bio: formData.bio || null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('プロフィール更新エラー:', profileError);
        }
      }

      // メール確認が必要かチェック
      if (authData.user && !authData.session) {
        // メール確認が必要
        alert('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
        router.push('/auth/login');
      } else {
        // メール確認不要（すぐにログイン可能）
        alert('登録が完了しました！');
        router.push('/main');
      }
    } catch (err) {
      console.error('登録エラー:', err);
      setError('登録処理中にエラーが発生しました');
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
              新規登録
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {step === 1 ? 'アカウント情報を入力' : 'プロフィール情報を入力'}
          </CardDescription>
          
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 1 ? 'bg-emerald-500 text-white' : 'bg-emerald-200 text-emerald-700'
            }`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-emerald-200"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* ステップ1: アカウント情報 */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
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
                  className="focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500">※後から変更できません</p>
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
                  className="focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                次へ
              </Button>
            </form>
          )}

          {/* ステップ2: プロフィール情報 */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ageRange" className="text-sm font-medium">
                  年齢層 <span className="text-red-500">*</span>
                </label>
                <select
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">選択してください</option>
                  <option value="18-24歳">18-24歳</option>
                  <option value="25-29歳">25-29歳</option>
                  <option value="30-34歳">30-34歳</option>
                  <option value="35-39歳">35-39歳</option>
                  <option value="40-44歳">40-44歳</option>
                  <option value="45-49歳">45-49歳</option>
                  <option value="50歳以上">50歳以上</option>
                </select>
                <p className="text-xs text-gray-500">※後から変更できません</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  性別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">選択してください</option>
                  <option value="男性">男性</option>
                  <option value="女性">女性</option>
                  <option value="その他">その他</option>
                  <option value="回答しない">回答しない</option>
                </select>
                <p className="text-xs text-gray-500">※後から変更できません</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  自己紹介 <span className="text-gray-400">(任意)</span>
                </label>
                <textarea
                  id="bio"
                  placeholder="旅行の好みや趣味などを自由に書いてください"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={500}
                  rows={4}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500">{formData.bio.length}/500文字（後から編集可能）</p>
              </div>

              <div className="bg-emerald-50 p-3 rounded-md text-sm text-emerald-800 border border-emerald-200">
                <p className="font-medium mb-1">⚠️ ご利用前に必ずご確認ください</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>18歳以上の方のみご利用いただけます</li>
                  <li>実際の集合は公共の場で行ってください</li>
                  <li>個人情報は絶対に公開しないでください</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  戻る
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
                  disabled={loading}
                >
                  {loading ? '登録中...' : '登録完了'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">既にアカウントをお持ちの方は </span>
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium">
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