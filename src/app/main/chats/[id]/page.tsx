// src/app/main/chats/[id]/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/ChatInterface'
import { BackButton } from '@/components/BackButton'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: chatRoomId } = await params
  
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // チャットルーム取得
  const { data: chatRoom, error: chatRoomError } = await supabase
    .from('chat_rooms')
    .select('id, post_id')
    .eq('id', chatRoomId)
    .maybeSingle()

  console.log('🔍 チャットルーム検索:', { chatRoomId, chatRoom, chatRoomError })

  // チャットルームが存在しない場合は投稿一覧へリダイレクト
  if (!chatRoom) {
    console.log('❌ チャットルームが見つかりません。投稿一覧へリダイレクト')
    redirect('/main/all-posts')
  }

  // 投稿情報取得
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, user_id')
    .eq('id', chatRoom.post_id)
    .maybeSingle()

  if (!post) {
    console.log('❌ 投稿が見つかりません')
    redirect('/main/all-posts')
  }

  // アクセス権確認：このユーザーがチャットメンバーかチェック
  const { data: membership } = await supabase
    .from('chat_members')
    .select('id')
    .eq('chat_room_id', chatRoom.id)
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('👤 メンバーシップ確認:', { chatRoomId: chatRoom.id, userId: user.id, membership })

  // メンバーでない場合は投稿詳細ページへリダイレクト
  if (!membership) {
    console.log('❌ このユーザーはチャットメンバーではありません。投稿詳細ページへリダイレクト')
    redirect(`/main/posts/${chatRoom.post_id}`)
  }

  // メンバー一覧取得
  const { data: rawMembers } = await supabase
    .from('chat_members')
    .select('id, user_id, joined_at')
    .eq('chat_room_id', chatRoom.id)
    .order('joined_at', { ascending: true })

  const userIds = (rawMembers || []).map(m => m.user_id)
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', userIds)

  const members = (rawMembers || []).map(member => ({
    ...member,
    profiles: profiles?.find(p => p.id === member.user_id) || {
      id: member.user_id,
      username: '不明なユーザー',
      display_name: null,
      avatar_url: null
    }
  }))

  // メッセージ取得
  const { data: rawMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_room_id', chatRoom.id)
    .order('created_at', { ascending: true })

  const messageUserIds = [...new Set((rawMessages || []).map(m => m.user_id))]
  
  const { data: messageProfiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', messageUserIds)

  const messages = (rawMessages || []).map(message => ({
    ...message,
    profiles: messageProfiles?.find(p => p.id === message.user_id) || {
      id: message.user_id,
      username: '不明なユーザー',
      display_name: null,
      avatar_url: null
    }
  }))

  console.log('✅ チャット情報取得完了:', { 
    chatRoomId: chatRoom.id, 
    membersCount: members.length, 
    messagesCount: messages.length 
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    {post.title}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {members.length}人のメンバー
                  </p>
                </div>
              </div>
              <BackButton />
            </div>
          </div>

          {/* チャットインターフェース */}
          <ChatInterface
            chatRoomId={chatRoom.id}
            postId={chatRoom.post_id}
            postTitle={post.title}
            currentUserId={user.id}
            initialMessages={messages}
            members={members}
          />
        </div>
      </div>
    </div>
  )
}