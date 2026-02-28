'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewModal } from './ReviewModal'

type Post = {
  id: string
  title: string
  created_at: string
  destination?: string
  travel_date?: string
  start_time?: string
  end_time?: string
  cost_type?: string
  cost_note?: string
  age_preference?: string
  gender_preference?: string
  max_participants?: number
  content?: string
  description?: string
}

type Profile = {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
}

type Props = {
  post: Post
  isMyPost: boolean
  reviewTargets: Profile[]
  alreadyReviewed: boolean
  currentUserId: string
}

export function EndedPostCard({ post, isMyPost, reviewTargets, alreadyReviewed, currentUserId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [reviewed, setReviewed] = useState(alreadyReviewed)

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 opacity-70 grayscale">
        <div className="p-4 sm:p-6">
          {/* バッジ */}
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

          {/* タイトル */}
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
                  year: 'numeric', month: 'long', day: 'numeric'
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
                  {new Date(post.travel_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
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
                    : post.start_time ? `${post.start_time.slice(0, 5)} 〜` : `〜 ${post.end_time!.slice(0, 5)}`}
                </span>
              </div>
            )}
            {post.cost_type && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600 truncate">{post.cost_type}{post.cost_note ? `・${post.cost_note}` : ''}</span>
              </div>
            )}
          </div>

          {/* タグ */}
          {(post.age_preference || post.gender_preference || post.max_participants) && (
            <div className="flex gap-2 flex-wrap mb-3 sm:mb-4">
              {post.age_preference && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{post.age_preference}</span>}
              {post.gender_preference && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{post.gender_preference}</span>}
              {post.max_participants && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">定員{post.max_participants}名</span>}
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

            {/* 評価ボタン */}
            {reviewTargets.length > 0 && (
              reviewed ? (
                <div className="flex-1 text-center px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  評価済み
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 text-center px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  ⭐ 評価する
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ReviewModal
          postId={post.id}
          postTitle={post.title}
          targets={reviewTargets}
          currentUserId={currentUserId}
          onClose={() => setShowModal(false)}
          onComplete={() => {
            setShowModal(false)
            setReviewed(true)
          }}
        />
      )}
    </>
  )
}