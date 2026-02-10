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

  // 参加申請を取得
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // 各参加申請者のプロフィール情報を個別に取得
  const requests = await Promise.all(
    (participants || []).map(async (participant) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            参加申請の管理
          </h1>
          <p className="text-gray-600">
            「{post.title}」への参加申請
          </p>
        </div>

        <ManageRequestsClient 
          requests={requests}
          postId={id}
          postTitle={post.title}
        />
      </div>
    </div>
  )
}