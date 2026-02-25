// src/components/ManageRequestsClient.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Request {
  id: string
  user_id: string
  post_id: string
  status: string
  message: string
  created_at: string
  profile?: {
    id: string
    displayname: string
    avatar_url?: string
    bio?: string
  }
}

export function ManageRequestsClient({ 
  requests: initialRequests, 
  postId,
  postTitle,
  postAuthorId
}: { 
  requests: Request[]
  postId: string
  postTitle: string
  postAuthorId: string
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleApprove = async (requestId: string, userId: string) => {
    if (processingId) return
    
    setProcessingId(requestId)
    try {
      console.log('🔄 承認処理開始:', { requestId, userId, postId })

      // 1. 現在のステータスを確認
      const { data: beforeUpdate, error: beforeError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', requestId)
        .single()
      
      console.log('📋 更新前のデータ:', JSON.stringify(beforeUpdate, null, 2))
      if (beforeError) console.error('❌ 更新前データ取得エラー:', beforeError)

      // 2. participantsのstatusを'joined'に更新（承認完了）
      const updatePayload = { 
        status: 'joined',
        updated_at: new Date().toISOString()
      }
      
      console.log('📤 更新リクエスト:', {
        table: 'participants',
        id: requestId,
        payload: updatePayload
      })

      const { data: updateData, error: updateError } = await supabase
        .from('participants')
        .update(updatePayload)
        .eq('id', requestId)
        .select()

      console.log('📝 更新結果:', JSON.stringify({ updateData, updateError }, null, 2))

      if (updateError) {
        console.error('❌ ステータス更新エラー:', updateError)
        alert('承認に失敗しました: ' + updateError.message)
        return
      }

      // 3. 更新後のデータを確認
      const { data: afterUpdate, error: afterError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', requestId)
        .single()
      
      console.log('✅ 更新後のデータ:', JSON.stringify(afterUpdate, null, 2))
      if (afterError) console.error('❌ 更新後データ取得エラー:', afterError)
      
      // ステータスが実際に変わったか確認
      if (afterUpdate?.status !== 'joined') {
        console.error('⚠️ 警告: ステータスが joined に変わっていません!', afterUpdate)
        alert('ステータス更新に問題がある可能性があります。データベースを確認してください。')
      }

      // 4. チャットルームを取得（投稿作成時に作成されているはず）
      const { data: existingRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle()

      console.log('🏠 チャットルーム取得:', { existingRoom, roomError })

      if (!existingRoom) {
        console.error('❌ チャットルームが見つかりません')
        alert('チャットルームが見つかりません。投稿者に連絡してください。')
        return
      }

      const chatRoomId = existingRoom.id
      console.log('✅ チャットルームID:', chatRoomId)

      // 5. 承認されたユーザーをチャットメンバーに追加
      console.log('👤 承認ユーザーをチャットに追加:', { chatRoomId, userId })
      
      // まず既にメンバーか確認
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('chat_members')
        .select('id')
        .eq('chat_room_id', chatRoomId)
        .eq('user_id', userId)
        .maybeSingle()

      console.log('🔍 既存メンバー確認:', { existingMember, memberCheckError })

      if (existingMember) {
        console.log('ℹ️ 既にチャットメンバーです')
      } else {
        // メンバーでなければ追加
        const memberPayload = {
          chat_room_id: chatRoomId,
          user_id: userId,
          joined_at: new Date().toISOString()
        }
        
        console.log('📤 メンバー追加リクエスト:', memberPayload)
        
        const { data: memberData, error: memberError } = await supabase
          .from('chat_members')
          .insert(memberPayload)
          .select()

        console.log('👥 メンバー追加結果:', { memberData, memberError })

        if (memberError) {
          console.error('❌ メンバー追加エラー:', memberError)
          alert('チャットへの追加に失敗しました: ' + memberError.message)
          return
        } else {
          console.log('✅ チャットメンバー追加成功')
        }
      }

      // 6. 通知を送る
      const notificationPayload = {
        user_id: userId,
        type: 'join_approved',
        content: `「${postTitle}」への参加が承認されました！`,
        related_id: postId,
        is_read: false
      }
      
      console.log('📤 通知送信リクエスト:', notificationPayload)
      
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationPayload)
        .select()

      console.log('🔔 通知送信結果:', { notificationData, notificationError })

      if (notificationError) {
        console.error('⚠️ 通知送信エラー:', notificationError)
      } else {
        console.log('✅ 通知送信完了')
      }

      // 7. ページをリロードしてステータスを更新
      console.log('✅✅✅ 承認処理完了! ✅✅✅')
      alert('✅ 参加を承認しました！承認されたユーザーはグループチャットに参加できます。')
      
      // ページ全体をリロードしてステータスを即座に反映
      window.location.reload()
      
    } catch (error) {
      console.error('❌ 予期しないエラー:', error)
      alert('エラーが発生しました: ' + (error as Error).message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string, userId: string) => {
    if (processingId) return
    
    if (!confirm('本当にこの参加申請を拒否しますか？')) {
      return
    }
    
    setProcessingId(requestId)
    try {
      const { error } = await supabase
        .from('participants')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) {
        console.error('拒否エラー:', error)
        alert('拒否に失敗しました: ' + error.message)
        return
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'join_rejected',
          content: `「${postTitle}」への参加申請が承認されませんでした。`,
          related_id: postId,
          is_read: false
        })

      setRequests(prev => prev.filter(req => req.id !== requestId))
      
      alert('参加申請を拒否しました')
      router.refresh()
      
    } catch (error) {
      console.error('予期しないエラー:', error)
      alert('エラーが発生しました')
    } finally {
      setProcessingId(null)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-lg">処理済みです</p>
        <p className="text-gray-500 text-sm mt-1">全ての参加申請が処理されました</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 bg-white"
        >
          {/* ユーザー情報 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
              {request.profile?.avatar_url ? (
                <img 
                  src={request.profile.avatar_url} 
                  alt={request.profile.displayname}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                request.profile?.displayname?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">
                {request.profile?.displayname || 'ユーザー名なし'}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(request.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* メッセージ */}
          {request.message && (
            <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                参加理由・メッセージ
              </p>
              <p className="text-gray-900 whitespace-pre-wrap">{request.message}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              onClick={() => handleApprove(request.id, request.user_id)}
              disabled={processingId !== null}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {processingId === request.id ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  処理中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  承認してチャットに招待
                </>
              )}
            </button>
            <button
              onClick={() => handleReject(request.id, request.user_id)}
              disabled={processingId !== null}
              className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingId === request.id ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  処理中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  拒否する
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}