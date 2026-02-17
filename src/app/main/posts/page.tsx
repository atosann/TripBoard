'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  description: string
  event_date: string
  location_name: string
  created_at: string
  author_id: string
}

export default function HomePage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentPosts = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching posts:', error)
        setRecentPosts([])
      } else {
        setRecentPosts(data || [])
        setPopularPosts(data?.slice(0, 3) || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setRecentPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-[fadeIn_0.8s_ease-out]">
            旅の仲間を見つけよう
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-emerald-50 max-w-3xl mx-auto animate-[fadeIn_1s_ease-out]">
            行きたい場所、やりたいこと。<br />
            同じ想いを持つ仲間と一緒に、特別な思い出を作りませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1.2s_ease-out]">
            <Link
              href="/main/posts"
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              投稿を探す
            </Link>
            <Link
              href="/main/posts/create"
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              投稿を作成
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 人気の投稿 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                人気の投稿
              </h2>
              <p className="text-gray-600">注目を集めている旅の募集</p>
            </div>
            <Link
              href="/main/posts"
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              すべて見る
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : popularPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600">まだ投稿がありません</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {popularPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-400"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link href={`/main/posts/${post.id}`} className="block p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {post.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {post.location_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700 font-medium">{post.location_name}</span>
                        </div>
                      )}

                      {post.event_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-gray-700">
                            {new Date(post.event_date).toLocaleDateString('ja-JP', {
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 最新の投稿 */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                最新の投稿
              </h2>
              <p className="text-gray-600">新しく投稿された旅の募集</p>
            </div>
            <Link
              href="/main/posts"
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              すべて見る
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                まだ投稿がありません
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                最初の投稿を作成して、旅の仲間を探しましょう！
              </p>
              <Link
                href="/main/posts/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                投稿を作成
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 animate-[fadeIn_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link href={`/main/posts/${post.id}`} className="block p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {post.location_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700 font-medium">{post.location_name}</span>
                        </div>
                      )}

                      {post.event_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-gray-700">
                            {new Date(post.event_date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <div className="flex items-center text-emerald-600 group-hover:text-emerald-700 font-semibold text-sm">
                        <span>詳細を見る</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 使い方ガイド */}
        <section className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            使い方はとってもシンプル
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">投稿を探す</h3>
              <p className="text-gray-600">
                行きたい場所や日程で<br />投稿を検索
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">応募する</h3>
              <p className="text-gray-600">
                気になる投稿に<br />メッセージを送る
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">旅に出る</h3>
              <p className="text-gray-600">
                仲間と一緒に<br />特別な思い出を作る
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}