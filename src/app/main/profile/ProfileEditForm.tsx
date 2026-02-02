'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types/database';

interface ProfileEditFormProps {
  profile: User | null;
  userId: string;
}

export function ProfileEditForm({ profile, userId }: ProfileEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    area: profile?.area || '',
  });

  const handleSave = async () => {
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userId);

      if (error) {
        alert('更新に失敗しました');
      } else {
        setEditing(false);
        router.refresh();
      }
    } catch (err) {
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">表示名</p>
          <p className="font-medium">{profile?.display_name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">自己紹介</p>
          <p className="whitespace-pre-wrap">
            {profile?.bio || '未設定'}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">居住エリア</p>
          <p>{profile?.area || '未設定'}</p>
        </div>

        <Button onClick={() => setEditing(true)} variant="outline">
          編集する
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">表示名</label>
        <Input
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">自己紹介</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          maxLength={500}
          placeholder="趣味や興味のあることを教えてください"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">居住エリア（市区町村レベル）</label>
        <Input
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          maxLength={100}
          placeholder="例：東京都渋谷区"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </Button>
        <Button
          onClick={() => {
            setEditing(false);
            setFormData({
              display_name: profile?.display_name || '',
              bio: profile?.bio || '',
              area: profile?.area || '',
            });
          }}
          variant="outline"
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}
