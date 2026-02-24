'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface ProfileData {
  bio: string;
  interests: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileData>({
    bio: '',
    interests: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/login'); return; }

        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (profile) {
          setFormData({
            bio: profile.bio || '',
            interests: profile.interests || '',
            instagram_url: profile.instagram_url || '',
            twitter_url: profile.twitter_url || '',
            facebook_url: profile.facebook_url || '',
          });
          setAvatarUrl(profile.avatar_url || null);
          setDisplayName(profile.display_name || '');
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err);
        setError('プロフィールの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [supabase, router]);

  // アバター画像をアップロード
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以内）
    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以内にしてください');
      return;
    }
    // 画像形式チェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    setAvatarUploading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未ログイン');

      // ファイル名をユーザーIDベースで固定（上書き更新）
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // キャッシュバスター付きURLで即時反映
      const urlWithCache = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithCache);

      // profilesテーブルを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() });

      if (updateError) throw updateError;

      setSuccess('アバターを更新しました！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('アバターアップロードエラー:', err);
      setError('アバターのアップロードに失敗しました。Supabaseのストレージバケット「profiles」が存在するか確認してください。');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateUrl = (url: string, platform: string): boolean => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      switch (platform) {
        case 'instagram': return hostname.includes('instagram.com');
        case 'twitter': return hostname.includes('twitter.com') || hostname.includes('x.com');
        case 'facebook': return hostname.includes('facebook.com') || hostname.includes('fb.com');
        default: return false;
      }
    } catch { return false; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.instagram_url && !validateUrl(formData.instagram_url, 'instagram')) {
      setError('正しいInstagramのURLを入力してください'); return;
    }
    if (formData.twitter_url && !validateUrl(formData.twitter_url, 'twitter')) {
      setError('正しいTwitter/XのURLを入力してください'); return;
    }
    if (formData.facebook_url && !validateUrl(formData.facebook_url, 'facebook')) {
      setError('正しいFacebookのURLを入力してください'); return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          bio: formData.bio.trim() || null,
          interests: formData.interests.trim() || null,
          instagram_url: formData.instagram_url.trim() || null,
          twitter_url: formData.twitter_url.trim() || null,
          facebook_url: formData.facebook_url.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setSuccess('プロフィールを更新しました！');
      setTimeout(() => { router.push('/main/profile'); }, 1500);
    } catch (err) {
      console.error('更新エラー:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/main/profile">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                戻る
              </button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">プロフィール編集</h1>
          <p className="text-gray-600">あなたの情報を更新して、他のユーザーに自己紹介しましょう</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* ── アバター設定セクション ── */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <p className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              アバター画像
            </p>
            <div className="flex items-center gap-6">
              {/* アバタープレビュー */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-md ring-2 ring-emerald-100 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
                  ) : (
                    displayName?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                {/* アップロード中インジケーター */}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* ボタンと説明 */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {avatarUploading ? 'アップロード中...' : '画像を選択'}
                </button>
                <p className="text-xs text-gray-500">JPG・PNG・GIF対応 / 5MB以内</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 自己紹介 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                自己紹介
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                maxLength={500}
                placeholder="自己紹介を書いてください。旅行の好みや趣味、一緒に旅行する時に大切にしていることなど..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">{formData.bio.length}/500文字</p>
            </div>

            {/* 興味・趣味 */}
            <div>
              <label htmlFor="interests" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                興味・趣味
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                maxLength={200}
                placeholder="カンマ区切りで入力（例：温泉, カフェ巡り, 写真撮影, 登山）"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="mt-1 text-sm text-gray-500">カンマ「,」で区切って複数入力できます</p>
            </div>

            {/* SNSリンク */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                SNSリンク（任意）
              </h3>
              <p className="text-sm text-gray-600 mb-6">SNSを登録すると、他のユーザーがあなたのことをより知ることができ、信頼性が高まります。</p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="instagram_url" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </label>
                  <input type="url" id="instagram_url" name="instagram_url" value={formData.instagram_url} onChange={handleChange}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all" />
                </div>

                <div>
                  <label htmlFor="twitter_url" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter / X
                  </label>
                  <input type="url" id="twitter_url" name="twitter_url" value={formData.twitter_url} onChange={handleChange}
                    placeholder="https://twitter.com/username または https://x.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                </div>

                <div>
                  <label htmlFor="facebook_url" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </label>
                  <input type="url" id="facebook_url" name="facebook_url" value={formData.facebook_url} onChange={handleChange}
                    placeholder="https://facebook.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">プライバシーに関する注意</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>SNSリンクは任意です。公開したくない場合は空欄のままで構いません</li>
                    <li>登録したSNSは他のユーザーに公開されます</li>
                    <li>個人を特定できる情報（住所、電話番号など）は記載しないでください</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}