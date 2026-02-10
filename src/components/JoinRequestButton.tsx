// src/components/JoinRequestButton.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function JoinRequestButton({ 
  postId, 
  postTitle,
  authorId 
}: { 
  postId: string
  postTitle: string
  authorId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRequest = async () => {
    if (!message.trim()) {
      alert('参加理由を入力してください')
      return
    }

    setIsLoading(true)
    try {
      // 認証確認
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('認証エラー:', userError)
        alert('ログインが必要です。再度ログインしてください。')
        router.push('/login')
        return
      }

      // プロフィール取得
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('プロフィール取得エラー:', profileError)
      }

      // 参加申請を作成
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          post_id: postId,
          user_id: user.id,
          status: 'pending',
          message: message.trim()
        })

      if (participantError) {
        console.error('参加申請エラー:', participantError)
        
        // エラーの詳細をログ出力
        console.error('Error details:', {
          code: participantError.code,
          message: participantError.message,
          details: participantError.details,
          hint: participantError.hint
        })
        
        if (participantError.code === '23505') {
          alert('既に参加申請を送信しています')
        } else if (participantError.code === 'PGRST204') {
          alert('データベースのスキーマエラーです。管理者に連絡してください。')
        } else {
          alert(`参加申請に失敗しました: ${participantError.message}`)
        }
        return
      }

      // 通知を作成
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: authorId,
          type: 'join_request',
          content: `${profile?.username || user.email}さんが「${postTitle}」への参加を申請しました`,
          related_id: postId,
          is_read: false
        })

      if (notificationError) {
        console.error('通知作成エラー:', notificationError)
      }

      alert('参加申請を送信しました！投稿者の承認をお待ちください。')
      setShowModal(false)
      setMessage('')
      router.refresh()
      
    } catch (error) {
      console.error('予期しないエラー:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        参加申請を送る
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">参加申請</h3>
            <p className="text-gray-600 mb-4">
              投稿者に参加の意思を伝えましょう。承認されるとグループチャットに参加できます。
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参加理由・メッセージ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="参加したい理由や意気込みを書いてください"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500文字
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setMessage('')
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleRequest}
                disabled={isLoading || !message.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    申請を送信
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}