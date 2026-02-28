// src/app/main/ended-posts/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MobileNav } from '../../../components/MobileNav'

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
      .neq('user_id', user.id) // 自分が作成した投稿は除外（重複防止）
      .lte('travel_date', now)
      .order('travel_date', { ascending: false })
    joinedPosts = data || []
  }

  // 重複なくマージして travel_date 降順にソート
  const allPosts = [...(myPosts || []), ...joinedPosts].sort(
    (a, b) => new Date(b.travel_date).getTime() - new Date(a.travel_date).getTime()
  )

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
          {/* 統計情報 */}
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

          {/* 投稿一覧 */}
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
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                投稿を探す
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {allPosts.map((post) => {
                const isMyPost = post.user_id === user.id
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 opacity-70 grayscale"
                  >
                    <div className="p-4 sm:p-6">
                      {/* 終了バッジ + 役割バッジ */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          募集受付終了
                        </div>
                        {isMyPost ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            主催
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            参加
                          </div>
                        )}
                      </div>

                      {/* ヘッダー部分 */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/main/posts/${post.id}`}
                            className="text-lg sm:text-xl font-bold text-gray-700 hover:text-emerald-600 transition-colors line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {post.created_at && new Date(post.created_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}に投稿
                          </p>
                        </div>
                      </div>

                      {/* 詳細情報 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {post.destination && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-600 truncate">{post.destination}</span>
                          </div>
                        )}
                        {post.travel_date && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600">
                              {new Date(post.travel_date).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {(post.start_time || post.end_time) && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                              {post.start_time && post.end_time
                                ? `${post.start_time.slice(0, 5)} 〜 ${post.end_time.slice(0, 5)}`
                                : post.start_time
                                ? `${post.start_time.slice(0, 5)} 〜`
                                : `〜 ${post.end_time.slice(0, 5)}`}
                            </span>
                          </div>
                        )}
                        {post.cost_type && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600 truncate">
                              {post.cost_type}{post.cost_note ? `・${post.cost_note}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* タグ */}
                      {(post.age_preference || post.gender_preference || post.max_participants) && (
                        <div className="flex gap-2 flex-wrap mb-3 sm:mb-4">
                          {post.age_preference && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {post.age_preference}
                            </span>
                          )}
                          {post.gender_preference && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {post.gender_preference}
                            </span>
                          )}
                          {post.max_participants && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              定員{post.max_participants}名
                            </span>
                          )}
                        </div>
                      )}

                      {/* 説明文 */}
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {post.content || post.description || '説明なし'}
                      </p>

                      {/* アクションボタン */}
                      <div className="flex gap-2 sm:gap-3">
                        <Link
                          href={`/main/posts/${post.id}`}
                          className="flex-1 text-center px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}