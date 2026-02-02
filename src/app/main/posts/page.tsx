import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 型定義を追加
type Post = {
  id: string
  title: string
  description: string
  event_date: string
  latitude: number
  longitude: number
  created_at: string
  author: {
    id: string
    display_name: string | null
  } | null
}

async function getPosts(): Promise<Post[]> {
  const supabase = await createServerClient()

  // まずセッション確認
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // 投稿取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      description,
      event_date,
      latitude,
      longitude,
      created_at,
      author:users!author_id (
        id,
        display_name
      )
    `)
    .eq('status', 'open')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching posts:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  // anyを経由して型変換
  return (posts as any) as Post[] || []
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">投稿一覧</h1>
          <div className="flex gap-4">
            <Link href="/main/posts/create">
              <Button>新規投稿</Button>
            </Link>
            <Link href="/main/profile">
              <Button variant="outline">プロフィール</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <p className="text-xl font-semibold text-gray-700 mb-2">
                まだ投稿がありません
              </p>
              <p className="text-gray-500 mb-6">
                最初の投稿を作成して、散策仲間を見つけましょう！
              </p>
            </div>
            <Link href="/main/posts/create">
              <Button size="lg">最初の投稿を作成</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/main/posts/${post.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {post.description}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📅 {new Date(post.event_date).toLocaleDateString('ja-JP')}</p>
                      <p>👤 {post.author?.display_name || '匿名'}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}