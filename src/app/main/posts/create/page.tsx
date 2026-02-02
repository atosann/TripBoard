'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CreatePostPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location_name: '',
    latitude: 35.6812,
    longitude: 139.7671,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError)
        alert('ユーザー情報の取得に失敗しました: ' + userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        alert('ログインしてください')
        router.push('/auth/login')
        setLoading(false)
        return
      }

      console.log('Creating post with data:', {
        author_id: user.id,
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location_name: formData.location_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
      })

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          location_name: formData.location_name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: 'open',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating post:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        alert('投稿の作成に失敗しました: ' + (error.message || JSON.stringify(error)))
        setLoading(false)
        return
      }

      console.log('Post created successfully:', data)
      alert('投稿を作成しました！')
      router.push('/main/posts')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('エラーが発生しました: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/main/posts">
              <Button variant="outline">← 戻る</Button>
            </Link>
            <h1 className="text-2xl font-bold">新規投稿</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>散策の詳細を入力</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="例：新宿御苑で紅葉散歩"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  説明 *
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="散策の内容や集合場所について詳しく説明してください"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500文字
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  開催日時 *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  集合場所の名前 *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="例：東京駅丸の内南口"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  位置情報
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  現在：東京駅周辺（デフォルト）
                </p>
                <p className="text-xs text-gray-500">
                  ※詳細な位置情報は後のアップデートで地図から選択できるようになります
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm font-medium mb-2">⚠️ 注意事項</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 集合場所は公共の場所を指定してください</li>
                  <li>• 個人情報（住所、電話番号など）は記載しないでください</li>
                  <li>• 詳細な待ち合わせ場所はチャットで調整してください</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '作成中...' : '投稿を作成'}
                </Button>
                <Link href="/main/posts" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}