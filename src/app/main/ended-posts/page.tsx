// src/app/main/ended-posts/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MobileNav } from '../../../components/MobileNav'
import { EndedPostCard } from '@/components/EndedPostCard'

export default async function EndedPostsPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const now = new Date().toISOString()

  // 自分が作成した期限切れ投稿
  const { data: myPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .lte('travel_date', now)
    .order('travel_date', { ascending: false })

  // 自分が参加承認された期限切れ投稿
  const { data: joinedParticipants } = await supabase
    .from('participants')
    .select('post_id')
    .eq('user_id', user.id)
    .eq('status', 'joined')

  let joinedPosts: any[] = []
  if (joinedParticipants && joinedParticipants.length > 0) {
    const joinedPostIds = joinedParticipants.map(p => p.post_id)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .in('id', joinedPostIds)
      .neq('user_id', user.id)
      .lte('travel_date', now)
      .order('travel_date', { ascending: false })
    joinedPosts = data || []
  }

  const allPosts = [...(myPosts || []), ...joinedPosts].sort(
    (a, b) => new Date(b.travel_date).getTime() - new Date(a.travel_date).getTime()
  )

  // 各投稿の参加者を取得
  const postIds = allPosts.map(p => p.id)
  let participantsMap: Record<string, any[]> = {}
  if (postIds.length > 0) {
    const { data: allParticipants } = await supabase
      .from('participants')
      .select(`
        post_id,
        profile:profiles!participants_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .in('post_id', postIds)
      .eq('status', 'joined')

    if (allParticipants) {
      for (const p of allParticipants) {
        if (!participantsMap[p.post_id]) participantsMap[p.post_id] = []
        participantsMap[p.post_id].push(p.profile)
      }
    }
  }

  // 自分がすでに評価済みの投稿IDを取得
  const { data: myReviews } = await supabase
    .from('reviews')
    .select('post_id')
    .eq('reviewer_id', user.id)

  const reviewedPostIds = new Set((myReviews || []).map(r => r.post_id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <MobileNav />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 pl-16 sm:pl-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">終了した投稿</h1>
            <Link
              href="/main/posts/create"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              投稿を作成
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">終了した投稿</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{allPosts.length}件</p>
              </div>
            </div>
          </div>

          {allPosts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-xl px-4">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">終了した投稿はありません</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">参加・主催した投稿の開催日が過ぎると、ここに表示されます</p>
              <Link
                href="/main/all-posts"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                投稿を探す
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {allPosts.map((post) => {
                const isMyPost = post.user_id === user.id
                const participants = participantsMap[post.id] || []
                // 自分以外の参加者が評価対象
                const reviewTargets = participants.filter(p => p.id !== user.id)
                const alreadyReviewed = reviewedPostIds.has(post.id)

                return (
                  <EndedPostCard
                    key={post.id}
                    post={post}
                    isMyPost={isMyPost}
                    reviewTargets={reviewTargets}
                    alreadyReviewed={alreadyReviewed}
                    currentUserId={user.id}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}