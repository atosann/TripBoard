// app/main/posts/[id]/manage/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ManageRequestsClient } from '@/components/ManageRequestsClient'

export default async function ManageRequestsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: post } = await supabase
    .from('posts')
    .select('id, title, user_id')
    .eq('id', id)
    .single()

  if (!post || post.user_id !== user.id) {
    redirect('/main')
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const requests = await Promise.all(
    (participants || []).map(async (participant) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, displayname, avatar_url, bio')
        .eq('id', participant.user_id)
        .single()

      return {
        id: participant.id,
        user_id: participant.user_id,
        post_id: participant.post_id,
        status: participant.status,
        message: participant.message || '',
        created_at: participant.created_at,
        profile: profile || undefined
      }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href={`/main/posts/${id}`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                戻る
              </button>
            </a>
            <h1 className="text-2xl font-bold text-gray-900">参加申請の管理</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="shadow-xl rounded-xl overflow-hidden border-0">
          {/* カードヘッダー */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">申請一覧</h2>
            <p className="text-emerald-50 text-sm mt-1">「{post.title}」への参加申請</p>
          </div>

          {/* カードボディ */}
          <div className="bg-white px-6 py-6">
            <ManageRequestsClient 
              requests={requests}
              postId={id}
              postTitle={post.title}
              postAuthorId={post.user_id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}