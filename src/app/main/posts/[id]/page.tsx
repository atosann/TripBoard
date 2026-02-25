// src/app/main/posts/[id]/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { JoinRequestButton } from '@/components/JoinRequestButton'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  // 投稿の詳細を取得
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (!post) {
    redirect('/main/all-posts')
  }

  // チャットルームを取得
  const { data: chatRoom } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('post_id', id)
    .maybeSingle()

  // チャットルームが見つからない場合は作成する
  let finalChatRoom = chatRoom
  if (!chatRoom) {
    const { data: newChatRoom } = await supabase
      .from('chat_rooms')
      .insert({ post_id: id })
      .select()
      .single()
    
    if (newChatRoom) {
      finalChatRoom = newChatRoom
      
      // 投稿者をチャットメンバーに追加
      if (post.user_id === user.id) {
        await supabase
          .from('chat_members')
          .insert({
            chat_room_id: newChatRoom.id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          })
      }
    }
  }

  // 参加メンバーを取得
  const { data: participants } = await supabase
    .from('participants')
    .select(`
      *,
      profile:profiles!participants_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', id)
    .eq('status', 'joined')

  // 自分が既に参加申請しているかチェック
  const { data: existingRequest } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isAuthor = post.user_id === user.id
  const hasRequested = !!existingRequest
  const isApproved = existingRequest?.status === 'joined'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* 戻るボタン */}
        <Link
          href="/main/all-posts"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          投稿一覧に戻る
        </Link>

        {/* タイトルカード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8">
            <h1 className="text-2xl font-bold text-white mb-3 leading-snug">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-emerald-50 text-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.created_at && new Date(post.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {participants?.length || 0}人参加中
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">

            {/* 投稿者情報 */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">投稿者</h2>
              <Link
                href={`/main/profile/${post.author.id}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
                  {post.author.avatar_url ? (
                    <img src={post.author.avatar_url} alt={post.author.display_name || post.author.username} className="w-full h-full object-cover" />
                  ) : (
                    (post.author.display_name || post.author.username)?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{post.author.display_name || post.author.username}</div>
                  {post.author.bio && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{post.author.bio}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </section>

            {/* 詳細情報 */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">詳細</h2>
              <div className="grid grid-cols-2 gap-3">
                {post.destination && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-0.5">目的地</div>
                      <div className="text-gray-900 font-semibold text-sm">{post.destination}</div>
                    </div>
                  </div>
                )}
                {post.travel_date && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-0.5">開催日時</div>
                      <div className="text-gray-900 font-semibold text-sm">
                        {new Date(post.travel_date).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {post.max_participants && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-0.5">募集人数</div>
                      <div className="text-gray-900 font-semibold text-sm">{post.max_participants}人</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium mb-0.5">参加状況</div>
                    <div className="text-gray-900 font-semibold text-sm">{participants?.length || 0} / {post.max_participants || '∞'}人</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 説明文 */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">内容</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {post.content || post.description || '説明はありません'}
                </p>
              </div>
            </section>

            {/* 参加メンバー */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                参加メンバー <span className="text-emerald-500">({participants?.length || 0}人)</span>
              </h2>
              {!participants || participants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">まだ参加者がいません</p>
                  <p className="text-gray-400 text-xs mt-1">最初の参加者になりましょう！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/main/profile/${participant.profile.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                        {participant.profile.avatar_url ? (
                          <img src={participant.profile.avatar_url} alt={participant.profile.display_name || participant.profile.username} className="w-full h-full object-cover" />
                        ) : (
                          (participant.profile.display_name || participant.profile.username)?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-emerald-700 transition-colors">{participant.profile.display_name || participant.profile.username}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(participant.created_at).toLocaleDateString('ja-JP')} 参加
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-2">
          {isAuthor ? (
            <>
              {finalChatRoom ? (
                <Link
                  href={`/main/chats/${finalChatRoom.id}`}
                  className="w-full text-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  グループチャット
                </Link>
              ) : (
                <div className="w-full text-center px-6 py-4 bg-gray-200 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed text-sm">
                  チャットルームを作成できませんでした
                </div>
              )}
              <Link
                href={`/main/posts/${post.id}/edit`}
                className="w-full text-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                投稿を編集
              </Link>
              <Link
                href={`/main/posts/${post.id}/manage`}
                className="w-full text-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                参加申請を管理
              </Link>
            </>
          ) : isApproved ? (
            <>
              {finalChatRoom ? (
                <Link
                  href={`/main/chats/${finalChatRoom.id}`}
                  className="w-full text-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  グループチャットに参加
                </Link>
              ) : (
                <div className="w-full text-center px-6 py-4 bg-gray-200 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed text-sm">
                  チャットルームを作成できませんでした
                </div>
              )}
              <div className="w-full text-center px-6 py-4 bg-emerald-50 text-emerald-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm border border-emerald-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                参加承認済み
              </div>
            </>
          ) : hasRequested ? (
            <div className="w-full text-center px-6 py-4 bg-amber-50 text-amber-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm border border-amber-200">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              承認待ち
            </div>
          ) : (
            <JoinRequestButton postId={post.id} postTitle={post.title} authorId={post.user_id} />
          )}
        </div>

      </div>
    </div>
  )
}