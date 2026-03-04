'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase-client'

type Post = {
  id: string
  title: string
  content: string
  description: string
  destination: string
  travel_date: string
  start_time: string
  end_time: string
  cost_type: string
  cost_note: string
  age_preference: string
  gender_preference: string
  max_participants: number
  created_at: string
}

export default function MainPage() {
  const router = useRouter()
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchRecentPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (!error) setRecentPosts(data || [])
      setLoadingPosts(false)
    }
    fetchRecentPosts()
  }, [])

  const handlePostClick = () => {
    router.push('/auth/login')
  }

  const categories = [
    { name: 'カラオケ', icon: '🎤', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { name: '登山・アウトドア', icon: '⛰️', color: 'bg-green-100 text-green-700 border-green-200' },
    { name: '居酒屋・飲み会', icon: '🍺', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { name: 'スポーツ', icon: '⚽', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'カフェ巡り', icon: '☕', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { name: 'ゲーム', icon: '🎲', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { name: '旅行', icon: '✈️', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { name: 'その他', icon: '🎉', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      {/* カテゴリセクション */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">カテゴリから探す</h2>
          <p className="text-gray-500 text-sm mb-6">気になるカテゴリをタップして募集を見てみよう</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="/auth/login"
                className={`${category.color} border-2 rounded-xl p-6 text-center hover:scale-105 transition-all shadow-sm hover:shadow-md`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-bold text-sm">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新着投稿セクション */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">🆕 新着の募集</h2>
          <p className="text-gray-500 text-sm mb-6">最近投稿されたメンバー募集です</p>

          {loadingPosts ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-lg mb-2">まだ募集がありません</p>
              <p className="text-gray-400 text-sm">ログインして最初の投稿をしてみましょう！</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => {
                const isExpired = post.travel_date && new Date(post.travel_date) < new Date()
                return (
                  <div
                    key={post.id}
                    className={`bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden border-2 ${
                      isExpired
                        ? 'border-gray-200 opacity-60 grayscale'
                        : 'hover:shadow-2xl border-gray-100 hover:border-emerald-300'
                    }`}
                  >
                    <div className="p-5">
                      {isExpired && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          募集受付終了
                        </div>
                      )}
                      <button
                        onClick={handlePostClick}
                        className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2 text-left mb-2 w-full"
                      >
                        {post.title}
                      </button>
                      <p className="text-xs text-gray-400 mb-3">
                        {post.created_at && new Date(post.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}に投稿
                      </p>
                      <div className="space-y-1.5 mb-3">
                        {post.destination && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="truncate">{post.destination}</span>
                          </div>
                        )}
                        {post.travel_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(post.travel_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                        {post.max_participants && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>定員 {post.max_participants}名</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {post.content || post.description || '説明なし'}
                      </p>
                      <button
                        onClick={handlePostClick}
                        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        詳細・参加する（要ログイン）
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {recentPosts.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/auth/login">
                <Button variant="outline" className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-full font-bold">
                  すべての募集を見る
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <span>👥</span>
              <span>メンバー募集掲示板</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            一緒に楽しもう！カラオケ、登山、飲み会、スポーツなど、様々なメンバー募集が集まる場所
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              サービスについて
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              お問い合わせ
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
            © 2026 メンバー募集掲示板. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}