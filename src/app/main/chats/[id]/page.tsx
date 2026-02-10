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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-4 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {post.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {members.length}人のメンバー
                </p>
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