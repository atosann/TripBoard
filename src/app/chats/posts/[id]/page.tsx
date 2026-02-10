import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/ChatInterface'

export default async function ChatRoomPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params  // paramsをawait
  
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  // チャットルーム情報を取得
  const { data: chatRoom } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      posts(id, title),
      chat_participants(
        user_id,
        profiles(id, username, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (!chatRoom) {
    notFound()
  }

  // 参加者であることを確認
  const isParticipant = chatRoom.chat_participants.some(
    (p: any) => p.user_id === user.id
  )

  if (!isParticipant) {
    notFound()
  }

  // メッセージを取得
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      profiles(id, username, avatar_url)
    `)
    .eq('chat_room_id', id)
    .order('created_at', { ascending: true })

  // メンバー情報を整形
  const members = chatRoom.chat_participants.map((p: any) => ({
    id: p.profiles.id,
    username: p.profiles.username,
    avatar_url: p.profiles.avatar_url,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {chatRoom.posts?.title} - チャット
        </h1>
        <ChatInterface 
          chatRoomId={id}
          postId={chatRoom.posts.id}
          postTitle={chatRoom.posts.title}
          currentUserId={user.id}
          initialMessages={messages || []}
          members={members}
        />
      </div>
    </div>
  )
}