'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'

type Profile = {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
}

type Props = {
  postId: string
  postTitle: string
  targets: Profile[]
  currentUserId: string
  onClose: () => void
  onComplete: () => void
}

export function ReviewModal({ postId, postTitle, targets, currentUserId, onClose, onComplete }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const supabase = createBrowserClient()
    setLoading(true)

    try {
      for (const target of targets) {
        const rating = ratings[target.id]
        if (!rating) continue

        await supabase.from('reviews').insert({
          post_id: postId,
          reviewer_id: currentUserId,
          reviewee_id: target.id,
          rating,
          comment: comments[target.id] || null,
        })
      }
      onComplete()
    } catch (error) {
      alert('送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const hasAnyRating = targets.some(t => ratings[t.id])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">参加者を評価する</h2>
          <p className="text-emerald-100 text-sm mt-1 line-clamp-1">{postTitle}</p>
        </div>

        <div className="p-6 space-y-6">
          {targets.map((target) => (
            <div key={target.id} className="border border-gray-200 rounded-xl p-4">
              {/* ユーザー情報 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                  {target.avatar_url ? (
                    <img src={target.avatar_url} alt={target.display_name || target.username} className="w-full h-full object-cover" />
                  ) : (
                    (target.display_name || target.username)?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="font-semibold text-gray-900">{target.display_name || target.username}</div>
              </div>

              {/* 星評価 */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">評価</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatings(prev => ({ ...prev, [target.id]: star }))}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (ratings[target.id] || 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* コメント */}
              <div>
                <p className="text-sm text-gray-600 mb-2">一言コメント（任意）</p>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={comments[target.id] || ''}
                  onChange={(e) => setComments(prev => ({ ...prev, [target.id]: e.target.value }))}
                  placeholder="一緒に活動した感想など..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{(comments[target.id] || '').length}/200文字</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !hasAnyRating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '送信中...' : '評価を送信'}
          </button>
        </div>
      </div>
    </div>
  )
}