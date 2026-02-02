'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { isSpam } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    location_name: '',
    latitude: 0,
    longitude: 0,
    event_date: '',
    max_participants: 5,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const supabase = createBrowserClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      location_name: formData.location_name || address,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('タイトルと説明を入力してください');
      return;
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      setError('地図上で集合場所を選択してください');
      return;
    }

    if (!formData.event_date) {
      setError('開催日時を選択してください');
      return;
    }

    // スパムチェック
    if (isSpam(formData.title + ' ' + formData.description)) {
      setError('不適切な内容が含まれている可能性があります');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      // 投稿作成
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (insertError) {
        setError('投稿の作成に失敗しました');
        setLoading(false);
        return;
      }

      // 成功したら詳細ページへ
      router.push(`/main/posts/${data.id}`);
    } catch (err) {
      setError('エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/main/posts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold ml-3">新しい投稿を作成</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ <span className="font-medium">集合場所の設定について：</span>
            公共の場所（駅改札、カフェ、観光地入口など）を指定してください。
            個人宅や人通りの少ない場所は避けてください。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>投稿内容</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例：浅草寺周辺を散策しませんか？"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">選択してください</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  説明 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="どんな散策を予定していますか？参加者に伝えたいことを書いてください。"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  集合場所名 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例：東京駅丸の内口改札前"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  地図で場所を選択 <span className="text-red-500">*</span>
                </label>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    開催日時 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    最大参加人数
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? '作成中...' : '投稿を作成'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
