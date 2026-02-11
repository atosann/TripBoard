// src/app/main/profile/[id]/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MobileNav } from '../../../../components/MobileNav'

export default async function ProfilePage({
  params,
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

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    redirect('/main/all-posts')
  }

  // ユーザーの投稿を取得
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(6)

  // 参加している投稿を取得
  const { data: participations } = await supabase
    .from('participants')
    .select(`
      *,
      post:post_id (
        id,
        title,
        destination,
        travel_date
      )
    `)
    .eq('user_id', id)
    .eq('status', 'approved')
    .limit(6)

  const isOwnProfile = user.id === id

  // プロフィール完成度を計算
  const calculateCompleteness = () => {
    let score = 0
    const fields = [
      profile?.display_name,
      profile?.bio,
      profile?.age_range,
      profile?.gender,
      profile?.interests,
    ]
    fields.forEach(field => {
      if (field && field.toString().length > 0) score += 20
    })
    return Math.round(score)
  }

  const completeness = calculateCompleteness()
  const postCount = posts?.length || 0
  const participationCount = participations?.length || 0
  const accountAge = profile.created_at 
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ハンバーガーメニュー */}
      <MobileNav />
      
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 pl-16 sm:pl-6">
          <div className="flex items-center justify-between">
            <Link
              href="/main/all-posts"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              戻る
            </Link>
            {isOwnProfile && (
              <Link
                href="/main/profile/edit"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* メインプロフィールカード */}
          <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10 border border-gray-200">
            {/* アバターと基本情報 */}
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-2xl mb-4 sm:mb-5 ring-4 ring-emerald-100">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="flex-1 w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 sm:mb-7">{profile.display_name || 'ユーザー'}</h1>
                
                {/* 自己紹介 */}
                {profile.bio && (
                  <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border-2 border-emerald-200 shadow-md max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">自己紹介</h3>
                    </div>
                    <p className="text-gray-900 text-base sm:text-lg leading-loose sm:leading-loose whitespace-pre-wrap text-left break-words font-normal">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* 興味・趣味 */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border-2 border-teal-200 shadow-md max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">興味・趣味</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.split(',').map((interest: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 統計情報 */}
                <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-6 sm:mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{postCount}</div>
                    <div className="text-sm sm:text-base text-gray-600 mt-2 font-medium">投稿</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{participationCount}</div>
                    <div className="text-sm sm:text-base text-gray-600 mt-2 font-medium">参加中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{accountAge}</div>
                    <div className="text-sm sm:text-base text-gray-600 mt-2 font-medium">日間利用</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細情報グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-6 sm:pt-8 border-t-2 border-gray-200 mt-6 sm:mt-8">
              {/* 年齢層 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 sm:p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-gray-600">年齢層</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {profile.age_range || '未設定'}
                  </div>
                </div>
              </div>

              {/* 性別 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 sm:p-6 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-gray-600">性別</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {profile.gender || '未設定'}
                  </div>
                </div>
              </div>

              {/* アカウント年齢 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 sm:p-6 border-2 border-green-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-gray-600">メンバー歴</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {accountAge >= 30 ? `${Math.floor(accountAge / 30)}ヶ月` : `${accountAge}日`}
                  </div>
                </div>
              </div>
            </div>

            {/* SNSリンク */}
            {(profile.instagram_url || profile.twitter_url || profile.facebook_url) && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">SNS</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter / X
                    </a>
                  )}
                  {profile.facebook_url && (
                    <a
                      href={profile.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 投稿一覧 */}
          <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">投稿</h2>
              <span className="ml-auto text-xs sm:text-sm font-semibold text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{postCount}件</span>
            </div>
            
            {!posts || posts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm sm:text-base text-gray-600 font-medium">まだ投稿がありません</p>
                {isOwnProfile && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">旅の募集を投稿してみましょう！</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/main/posts/${post.id}`}
                    className="block group bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all p-3 sm:p-5 border border-gray-200 hover:border-emerald-300"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">{post.content}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                      {post.destination && (
                        <span className="flex items-center gap-1 sm:gap-1.5 bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {post.destination}
                        </span>
                      )}
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 参加中の投稿 */}
          <div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">参加中の旅</h2>
              <span className="ml-auto text-xs sm:text-sm font-semibold text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{participationCount}件</span>
            </div>
            
            {!participations || participations.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm sm:text-base text-gray-600 font-medium">参加中の投稿がありません</p>
                {isOwnProfile && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">興味のある旅に参加してみましょう！</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {participations.map((participation: any) => (
                  <Link
                    key={participation.id}
                    href={`/main/posts/${participation.post.id}`}
                    className="block group bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all p-3 sm:p-5 border border-gray-200 hover:border-green-300"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">{participation.post.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                      {participation.post.destination && (
                        <span className="flex items-center gap-1 sm:gap-1.5 bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {participation.post.destination}
                        </span>
                      )}
                      {participation.post.travel_date && (
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(participation.post.travel_date).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}