// src/app/main/posts/[id]/requests/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Supabaseから返ってくる型（配列）
type RawRequest = {
  id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
  profiles: {
    id: string
    username: string
    age_range?: string
    gender?: string
    bio?: string
    avatar_url?: string
  }[] | null  // 配列またはnull
}

// 画面で使う型（オブジェクト）
type Request = {
  id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
  profiles: {
    id: string
    username: string
    age_range?: string
    gender?: string
    bio?: string
    avatar_url?: string
  } | null  // オブジェクト
}

export default function RequestsManagementPage({ params }: { params: { id: string } }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 投稿情報を取得
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (postError || !postData) {
        console.error('Post error:', postError)
        router.push('/main/all-posts')
        return
      }

      if (postData.author_id !== user.id) {
        router.push(`/main/posts/${params.id}`)
        return
      }

      setPost(postData)

      // participantsテーブルから申請一覧を取得
      const { data: rawData, error: requestsError } = await supabase
        .from('participants')
        .select(`
          id,
          message,
          status,
          created_at,
          user_id,
          profiles:user_id (
            id,
            username,
            age_range,
            gender,
            bio,
            avatar_url
          )
        `)
        .eq('post_id', params.id)
        .order('created_at', { ascending: false })

      console.log('Raw data:', rawData)
      console.log('Requests error:', requestsError)

      if (requestsError) {
        console.error('データ取得エラー:', requestsError)
      }

      if (rawData) {
        // 配列を単一オブジェクトに変換
        const transformedData: Request[] = (rawData as RawRequest[]).map(item => ({
          ...item,
          profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
            ? item.profiles[0] 
            : null
        }))
        
        console.log('Transformed data:', transformedData)
        setRequests(transformedData)
      }

    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessing(requestId)
    try {
      const { error } = await supabase
        .from('participants')
        .update({ status })
        .eq('id', requestId)

      if (error) {
        console.error('ステータス更新エラー:', error)
        alert('処理に失敗しました')
        return
      }

      const request = requests.find(r => r.id === requestId)
      if (request && status === 'approved' && post) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'join_approved',
            content: `「${post.title}」への参加が承認されました`,
            related_id: params.id,
            is_read: false
          })

        if (notifError) {
          console.error('通知作成エラー:', notifError)
        }
      }

      alert(status === 'approved' ? '承認しました' : '拒否しました')
      loadData()

    } catch (error) {
      console.error('ステータス更新エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/main/posts/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            投稿に戻る
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">参加申請の管理</h1>
          {post && (
            <p className="text-gray-600">投稿: {post.title}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <div className="text-sm text-gray-600">保留中</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{approvedRequests.length}</div>
            <div className="text-sm text-gray-600">承認済み</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{rejectedRequests.length}</div>
            <div className="text-sm text-gray-600">拒否済み</div>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">保留中の申請</h2>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <Link href={`/main/users/${request.user_id}`}>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 cursor-pointer hover:scale-105 transition-transform">
                        {request.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link 
                            href={`/main/users/${request.user_id}`}
                            className="font-bold text-gray-900 hover:text-blue-600"
                          >
                            {request.profiles?.username || '匿名ユーザー'}
                          </Link>
                          {request.profiles?.age_range && (
                            <span className="text-sm text-gray-600 ml-2">
                              {request.profiles.age_range}
                              {request.profiles.gender && ` • ${request.profiles.gender}`}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>

                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {request.profiles?.bio && (
                        <p className="text-sm text-gray-600 mb-3">
                          {request.profiles.bio}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                          disabled={processing === request.id}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-400"
                        >
                          {processing === request.id ? '処理中...' : '✓ 承認'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'rejected')}
                          disabled={processing === request.id}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-400"
                        >
                          {processing === request.id ? '処理中...' : '✕ 拒否'}
                        </button>
                        <Link
                          href={`/main/users/${request.user_id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                          プロフィール
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approvedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">承認済み（{approvedRequests.length}人）</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedRequests.map(request => (
                  <Link
                    key={request.id}
                    href={`/main/users/${request.user_id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                      {request.profiles?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {request.profiles?.username || '匿名ユーザー'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <div className="text-green-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {rejectedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">拒否済み（{rejectedRequests.length}人）</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-2">
                {rejectedRequests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {request.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">
                          {request.profiles?.username || '匿名ユーザー'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                    <div className="text-red-600 text-sm font-semibold">
                      拒否済み
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">参加申請はまだありません</h3>
            <p className="text-gray-600">申請が届くとここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  )
}