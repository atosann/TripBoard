'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  profiles: {
    username: string
  }
}

export default function GroupChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkMembership()
    loadMessages()
    
    const channel = subscribeToMessages()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setCurrentUser(user)

    const { data: memberData } = await supabase
      .from('group_members')
      .select('*')
      .eq('post_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!memberData) {
      alert('このチャットにアクセスする権限がありません')
      router.push(`/main/posts/${params.id}`)
      return
    }

    setIsMember(true)
    setLoading(false)
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        profiles (
          username
        )
      `)
      .eq('post_id', params.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`group_messages:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `post_id=eq.${params.id}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('group_messages')
            .select(`
              *,
              profiles (
                username
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
          }
        }
      )
      .subscribe()

    return channel
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser) return

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          post_id: params.id,
          user_id: currentUser.id,
          message: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
    } catch (error: any) {
      alert('メッセージの送信に失敗しました: ' + error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>
  }

  if (!isMember) {
    return null
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <button
          onClick={() => router.push(`/main/posts/${params.id}`)}
          className="text-blue-600 hover:underline mb-2"
        >
          ← 投稿に戻る
        </button>
        <h1 className="text-2xl font-bold">グループチャット</h1>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user_id === currentUser?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p className="text-xs opacity-75 mb-1">
                  {message.profiles?.username || '名無し'}
                </p>
                <p className="whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* メッセージ入力 */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  )
}
