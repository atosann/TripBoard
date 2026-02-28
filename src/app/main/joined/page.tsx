// src/app/main/joined/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function JoinedPostsPage() {
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

  const { data: chatMembers } = await supabase
    .from('chat_members')
    .select('chat_room_id, joined_at')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  console.log('📋 参加中のチャットルーム:', chatMembers)

  if (!chatMembers || chatMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">参加中の投稿</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">まだ参加している投稿がありません</h2>
              <p className="text-gray-600 mb-6">興味のある投稿に参加申請してみましょう！</p>
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
          </div>
        </main>
      </div>
    )
  }

  const chatRoomIds = chatMembers.map(cm => cm.chat_room_id)
  
  const { data: chatRooms } = await supabase
    .from('chat_rooms')
    .select('id, post_id')
    .in('id', chatRoomIds)

  console.log('🏠 チャットルーム情報:', chatRooms)

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">参加中の投稿</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-gray-600">データの読み込みに失敗しました</p>
          </div>
        </main>
      </div>
    )
  }

  const postIds = chatRooms.map(cr => cr.post_id)
  
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:user_id (
        id,
        username,
        avatar_url
      )
    `)
    .in('id', postIds)
    .gt('travel_date', new Date().toISOString())
    .order('created_at', { ascending: false })

  console.log('📝 投稿情報:', posts)

  const postsWithChatRoom = (posts || []).map(post => {
    const chatRoom = chatRooms.find(cr => cr.post_id === post.id)
    const memberInfo = chatMembers.find(cm => cm.chat_room_id === chatRoom?.id)
    return {
      ...post,
      chatRoomId: chatRoom?.id,
      joinedAt: memberInfo?.joined_at
    }
  })

  const { data: allMembers } = await supabase
    .from('chat_members')
    .select('chat_room_id')
    .in('chat_room_id', chatRoomIds)

  const memberCounts = chatRoomIds.reduce((acc, roomId) => {
    acc[roomId] = allMembers?.filter(m => m.chat_room_id === roomId).length || 0
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">参加中の投稿</h1>
            <Link
              href="/main/all-posts"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
              </svg>
              他の投稿を探す
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">あなたが参加している投稿</p>
                <p className="text-2xl font-bold text-gray-900">{postsWithChatRoom.length}件</p>
              </div>
            </div>
          </div>

          {postsWithChatRoom.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">参加中の投稿がありません</h2>
              <p className="text-gray-600 mb-6">興味のある投稿に参加申請してみましょう！</p>
              <Link
                href="/main/all-posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
                </svg>
                投稿を探す
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {postsWithChatRoom.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          href={`/main/posts/${post.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {post.joinedAt && new Date(post.joinedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}に参加
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {post.chatRoomId ? memberCounts[post.chatRoomId] || 0 : 0}人
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author?.avatar_url ? (
                          <img src={post.author.avatar_url} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          post.author?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{post.author?.username}</p>
                        <p className="text-xs text-gray-500">主催者</p>
                      </div>
                    </div>

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
                      {(post.start_time || post.end_time) && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">
                            {post.start_time && post.end_time
                              ? `${post.start_time.slice(0, 5)} 〜 ${post.end_time.slice(0, 5)}`
                              : post.start_time
                              ? `${post.start_time.slice(0, 5)} 〜`
                              : `〜 ${post.end_time.slice(0, 5)}`}
                          </span>
                        </div>
                      )}
                      {post.cost_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">
                            {post.cost_type}{post.cost_note ? `・${post.cost_note}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {(post.age_preference || post.gender_preference || post.max_participants) && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {post.age_preference && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                            {post.age_preference}
                          </span>
                        )}
                        {post.gender_preference && (
                          <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                            {post.gender_preference}
                          </span>
                        )}
                        {post.max_participants && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                            定員{post.max_participants}名
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.content || post.description || '説明なし'}
                    </p>

                    <div className="flex gap-3">
                      {post.chatRoomId && (
                        <Link
                          href={`/main/chats/${post.chatRoomId}`}
                          className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          チャット
                        </Link>
                      )}
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
      </main>
    </div>
  )
}