// src/app/main/search/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ prefecture?: string; keyword?: string }>
}) {
  const params = await searchParams
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

  // 検索条件がある場合のみ投稿を取得
  let posts = null
  if (params.prefecture || params.keyword) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    // 都道府県検索 - destination カラムで検索（「栃木県」を含む）
    if (params.prefecture) {
      query = query.ilike('destination', `%${params.prefecture}%`)
    }

    // キーワード検索 - title と content で検索
    if (params.keyword) {
      query = query.or(`title.ilike.%${params.keyword}%,content.ilike.%${params.keyword}%`)
    }

    const { data, error } = await query
    
    // デバッグ用
    if (error) {
      console.error('検索エラー:', error)
    }
    console.log('検索パラメータ:', params)
    console.log('検索結果:', data)
    
    posts = data
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {params.prefecture ? `${params.prefecture}の投稿` : '投稿を探す'}
            </h1>
            <Link
              href="/main/all-posts"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              他の投稿を探す
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 検索バー */}
          <div className="mb-6">
            <SearchBar currentKeyword={params.keyword} currentPrefecture={params.prefecture} searchPath="/main/search" />
          </div>

          {/* 検索結果 */}
          {posts && (
            <div>
              {/* 統計情報 */}
              <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {params.prefecture && params.keyword 
                          ? `${params.prefecture}で「${params.keyword}」の検索結果`
                          : params.prefecture
                          ? `${params.prefecture}の投稿`
                          : params.keyword 
                          ? `「${params.keyword}」の検索結果`
                          : '検索結果'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{posts?.length || 0}件</p>
                    </div>
                  </div>
                  {(params.prefecture || params.keyword) && (
                    <Link
                      href="/main/search"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      検索をクリア
                    </Link>
                  )}
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                  <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿が見つかりませんでした</h2>
                  <p className="text-gray-600 mb-6">
                    {params.prefecture && params.keyword 
                      ? `${params.prefecture}で「${params.keyword}」に一致する投稿がありません`
                      : params.prefecture
                      ? `${params.prefecture}の投稿はまだありません`
                      : params.keyword
                      ? `「${params.keyword}」に一致する投稿がありません`
                      : '検索条件に一致する投稿がありません'}
                  </p>
                  <Link
                    href="/main/all-posts"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    投稿を探す
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300"
                    >
                      <div className="p-6">
                        {/* ヘッダー部分 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              href={`/main/posts/${post.id}`}
                              className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {post.created_at && new Date(post.created_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}に投稿
                            </p>
                          </div>
                        </div>

                        {/* 投稿者情報 */}
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                            {post.profiles?.avatar_url ? (
                              <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              post.profiles?.username?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{post.profiles?.username}</p>
                            <p className="text-xs text-gray-500">投稿者</p>
                          </div>
                        </div>

                        {/* 詳細情報 */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {post.destination && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-700">{post.destination}</span>
                            </div>
                          )}
                          {post.travel_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-700">
                                {new Date(post.travel_date).toLocaleDateString('ja-JP', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 説明文 */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.content || post.description || '説明なし'}
                        </p>

                        {/* アクションボタン */}
                        <div className="flex gap-3">
                          <Link
                            href={`/main/posts/${post.id}`}
                            className="flex-1 text-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            詳細
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 検索前の状態 */}
          {!posts && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿を検索</h2>
              <p className="text-gray-600 mb-6">上の検索バーから投稿を検索できます</p>
              <Link
                href="/main/all-posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                投稿を探す
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}