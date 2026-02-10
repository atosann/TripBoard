import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'

export default async function ChatRoomPage({ 
  params 
}: { 
  params: { id: string } 
}) {
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
      posts(title),
      chat_participants(
        user_id,
        profiles(username, avatar_url)
      )
    `)
    .eq('id', params.id)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {chatRoom.posts?.title} - チャット
        </h1>
        <ChatInterface 
          chatRoomId={params.id} 
          currentUserId={user.id}
          participants={chatRoom.chat_participants}
        />
      </div>
    </div>
  )
}