// src/app/main/users/[id]/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id: userId } = await params
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

  // 自分のプロフィールの場合はリダイレクト
  if (userId === user.id) {
    redirect('/main/profile')
  }

  // ユーザー情報取得
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    notFound()
  }

  // 投稿数取得
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, event_date, location_name, created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const postCount = posts?.length || 0

  // アカウント年齢計算
  const accountAge = profile.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // プロフィール完成度
  const calculateCompleteness = () => {
    let score = 0
    const fields = [profile.username, profile.bio, profile.age_range, profile.gender, profile.interests]
    fields.forEach(field => {
      if (field && field.toString().length > 0) score += 20
    })
    return score
  }

  const completeness = calculateCompleteness()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
        </div>

        <div className="grid gap-6">
          {/* ヘッダーカード */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-start gap-6">
              {/* アバター */}
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.username || '匿名ユーザー'}
                </h1>
                {(profile.age_range || profile.gender) && (
                  <div className="text-indigo-100 mb-4">
                    {profile.age_range}
                    {profile.age_range && profile.gender && ' • '}
                    {profile.gender}
                  </div>
                )}

                {/* 信頼性スコア */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">信頼性スコア</span>
                    <span className="text-2xl font-bold">{completeness}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2"
                      style={{ width: `${completeness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 活動実績 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">活動実績</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-blue-600 text-3xl mb-2">📝</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{postCount}</div>
                <div className="text-sm text-gray-600">投稿数</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                <div className="text-green-600 text-3xl mb-2">📅</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{accountAge}</div>
                <div className="text-sm text-gray-600">日前に登録</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                <div className="text-purple-600 text-3xl mb-2">✨</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{completeness}%</div>
                <div className="text-sm text-gray-600">プロフィール完成度</div>
              </div>
            </div>

            {/* 自己紹介 */}
            {profile.bio && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">自己紹介</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* 興味・趣味 */}
            {profile.interests && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">興味・趣味</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.split(',').map((interest: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 最近の投稿 */}
          {posts && posts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">最近の投稿</h2>
              
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/main/posts/${post.id}`}
                    className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {post.location_name && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {post.location_name}
                        </span>
                      )}
                      {post.event_date && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(post.event_date).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">安全な利用のために</h3>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• 初対面の方との散策は、公共の場所で行いましょう</li>
                  <li>• 個人情報（住所、電話番号など）の共有は慎重に</li>
                  <li>• 不審な行動があれば、すぐに運営に報告してください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}