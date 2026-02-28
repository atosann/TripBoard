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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    redirect('/main/all-posts')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(6)

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

  // 評価データを取得
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, reviewer:reviewer_id(display_name, avatar_url)')
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  const isOwnProfile = user.id === id

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

  const bioLength = profile.bio?.length || 0
  const bioTextSize =
    bioLength > 200 ? 'text-xs' :
    bioLength > 100 ? 'text-sm' :
    'text-base'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-sm font-semibold shadow transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                プロフィールを編集
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {profile.display_name || 'ユーザー'}さんのプロフィール
          </h1>

          <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">

            <div className="flex sm:flex-row gap-4 sm:gap-6">

              <div className="flex flex-col gap-3 w-28 sm:w-52 flex-shrink-0">
                <div className="w-24 h-24 sm:w-full sm:aspect-square bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center text-white text-3xl sm:text-5xl font-bold shadow-md ring-2 ring-emerald-100 overflow-hidden flex-shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    profile.display_name?.charAt(0).toUpperCase()
                  )}
                </div>

                <table className="hidden sm:table w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">ニックネーム</td>
                      <td className="py-2 font-semibold text-gray-900 text-xs">{profile.display_name || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">性別</td>
                      <td className="py-2 text-gray-900 text-xs">{profile.gender || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">年齢層</td>
                      <td className="py-2 text-gray-900 text-xs">{profile.age_range || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">登録日</td>
                      <td className="py-2 text-gray-900 text-xs">
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
                          : '不明'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">投稿数</td>
                      <td className="py-2 text-gray-900 text-xs">{postCount}件</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">参加中</td>
                      <td className="py-2 text-gray-900 text-xs">{participationCount}件</td>
                    </tr>
                    {avgRating !== null && (
                      <tr>
                        <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">評価</td>
                        <td className="py-2 text-xs">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-bold text-gray-900 ml-1">{avgRating.toFixed(1)}</span>
                          <span className="text-gray-400 ml-1">({reviews!.length}件)</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex-1 min-w-0">

                <table className="sm:hidden w-full text-sm mb-0">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">ニックネーム</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-xs">{profile.display_name || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">性別</td>
                      <td className="py-1.5 text-gray-900 text-xs">{profile.gender || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">年齢層</td>
                      <td className="py-1.5 text-gray-900 text-xs">{profile.age_range || '未設定'}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">登録日</td>
                      <td className="py-1.5 text-gray-900 text-xs">
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
                          : '不明'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">投稿数</td>
                      <td className="py-1.5 text-gray-900 text-xs">{postCount}件</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">参加中</td>
                      <td className="py-1.5 text-gray-900 text-xs">{participationCount}件</td>
                    </tr>
                    {avgRating !== null && (
                      <tr>
                        <td className="py-1.5 pr-2 text-gray-500 font-medium whitespace-nowrap text-xs">評価</td>
                        <td className="py-1.5 text-xs">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-bold text-gray-900 ml-1">{avgRating.toFixed(1)}</span>
                          <span className="text-gray-400 ml-1">({reviews!.length}件)</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="hidden sm:flex flex-col gap-4 border-l border-gray-200 pl-6">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-2">自己紹介</p>
                    {profile.bio ? (
                      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${bioTextSize} text-gray-700 leading-relaxed whitespace-pre-wrap break-words min-h-[6rem]`}>
                        {profile.bio}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[6rem] flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-gray-400">自己紹介はまだありません</p>
                        {isOwnProfile && (
                          <Link href="/main/profile/edit" className="text-xs text-emerald-600 hover:underline font-medium">
                            編集して追加する
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">興味・趣味</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.split(',').map((interest: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs font-semibold shadow-sm">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(profile.instagram_url || profile.twitter_url || profile.facebook_url) && (
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">SNS</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.instagram_url && (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
                          </a>
                        )}
                        {profile.twitter_url && (
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Twitter / X
                          </a>
                        )}
                        {profile.facebook_url && (
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* スマホ: 自己紹介・興味・SNS */}
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">自己紹介</p>
                {profile.bio ? (
                  <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${bioTextSize} text-gray-700 leading-relaxed whitespace-pre-wrap break-words`}>
                    {profile.bio}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center gap-2 py-6">
                    <p className="text-sm text-gray-400">自己紹介はまだありません</p>
                    {isOwnProfile && (
                      <Link href="/main/profile/edit" className="text-xs text-emerald-600 hover:underline font-medium">
                        編集して追加する
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">興味・趣味</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.split(',').map((interest: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs font-semibold shadow-sm">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile.instagram_url || profile.twitter_url || profile.facebook_url) && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">SNS</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.instagram_url && (
                      <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs font-semibold shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-xs font-semibold shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter / X
                      </a>
                    )}
                    {profile.facebook_url && (
                      <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full text-xs font-semibold shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 評価セクション */}
            {reviews && reviews.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm text-gray-500 font-medium">評価</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">⭐</span>
                    <span className="font-bold text-gray-900">{avgRating!.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({reviews.length}件)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {reviews.slice(0, 3).map((review: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</span>
                        <span className="text-xs text-gray-500">{review.reviewer?.display_name || '匿名'}</span>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 投稿一覧 */}
          <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <div className="px-5 py-3 bg-emerald-600 text-white text-sm font-bold">投稿一覧</div>
              <div className="px-5 py-3 text-sm text-gray-500 font-medium">{postCount}件</div>
            </div>
            <div className="p-4 sm:p-6">
              {!posts || posts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">まだ投稿がありません</p>
                  {isOwnProfile && (
                    <Link href="/main/posts/create" className="inline-block mt-3 text-sm text-emerald-600 hover:underline">
                      投稿を作成する
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/main/posts/${post.id}`}
                      className="flex items-center gap-3 sm:gap-4 group p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          {post.destination && <span>{post.destination}</span>}
                          {post.destination && <span>·</span>}
                          <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 参加中の投稿 */}
          <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <div className="px-5 py-3 bg-teal-600 text-white text-sm font-bold">参加中の投稿</div>
              <div className="px-5 py-3 text-sm text-gray-500 font-medium">{participationCount}件</div>
            </div>
            <div className="p-4 sm:p-6">
              {!participations || participations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">参加中の投稿がありません</p>
                  {isOwnProfile && (
                    <Link href="/main/all-posts" className="inline-block mt-3 text-sm text-teal-600 hover:underline">
                      投稿を探す
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {participations.map((participation: any) => (
                    <Link
                      key={participation.id}
                      href={`/main/posts/${participation.post.id}`}
                      className="flex items-center gap-3 sm:gap-4 group p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-teal-200 transition-all"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">{participation.post.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          {participation.post.destination && <span>{participation.post.destination}</span>}
                          {participation.post.destination && participation.post.travel_date && <span>·</span>}
                          {participation.post.travel_date && (
                            <span>{new Date(participation.post.travel_date).toLocaleDateString('ja-JP')}</span>
                          )}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}