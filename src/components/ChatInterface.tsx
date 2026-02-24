// src/components/ChatInterface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  chat_room_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface Member {
  id: string
  user_id: string
  joined_at: string
  profiles: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export function ChatInterface({
  chatRoomId,
  postId,
  postTitle,
  currentUserId,
  initialMessages,
  members,
}: {
  chatRoomId: string
  postId: string
  postTitle: string
  currentUserId: string
  initialMessages: Message[]
  members: Member[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    console.log('🔌 Realtime購読開始:', chatRoomId)
    
    const channel: RealtimeChannel = supabase
      .channel(`chat-${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          console.log('🔔 新しいメッセージ受信:', payload)
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          console.log('👤 プロフィール取得:', profile)

          const newMsg: Message = {
            id: payload.new.id,
            chat_room_id: payload.new.chat_room_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            profiles: profile || {
              id: payload.new.user_id,
              username: '不明なユーザー',
              display_name: null,
              avatar_url: null,
            },
          }

          console.log('✅ メッセージ追加:', newMsg)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) {
              console.log('⚠️ 重複メッセージをスキップ')
              return prev
            }
            return [...prev, newMsg]
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime接続状態:', status)
      })

    return () => {
      console.log('🔌 Realtime購読解除')
      supabase.removeChannel(channel)
    }
  }, [chatRoomId])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    console.log('📤 メッセージ送信開始:', {
      chatRoomId,
      userId: currentUserId,
      content: newMessage.trim()
    })

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          user_id: currentUserId,
          content: newMessage.trim(),
        })
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('❌ メッセージ送信エラー:', error)
        alert('メッセージの送信に失敗しました: ' + error.message)
        return
      }

      console.log('✅ メッセージ送信成功:', data)
      
      const newMsg: Message = {
        id: data.id,
        chat_room_id: data.chat_room_id,
        user_id: data.user_id,
        content: data.content,
        created_at: data.created_at,
        profiles: data.profiles,
      }
      
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) {
          return prev
        }
        return [...prev, newMsg]
      })
      
      setNewMessage('')
    } catch (error) {
      console.error('❌ 予期しないエラー:', error)
      alert('エラーが発生しました: ' + String(error))
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* メッセージエリア */}
      <div className="flex-1 flex flex-col">
        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3" style={{ backgroundColor: '#f0f4f8' }}>
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">まだメッセージがありません</p>
              <p className="text-sm text-gray-400 mt-1">最初のメッセージを送ってみましょう！</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.user_id === currentUserId
              const displayName = message.profiles.display_name || message.profiles.username
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id
              const showName = !isOwnMessage && showAvatar

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* アバター */}
                  {!isOwnMessage && (
                    <div className="flex-shrink-0 w-9 h-9">
                      {showAvatar ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow">
                          {message.profiles.avatar_url ? (
                            <img src={message.profiles.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                      ) : (
                        <div className="w-9 h-9" />
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                        {displayName}
                      </span>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isOwnMessage && (
                        <span className="text-xs text-gray-400 mb-0.5 flex-shrink-0">
                          {new Date(message.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          isOwnMessage
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      {!isOwnMessage && (
                        <span className="text-xs text-gray-400 mb-0.5 flex-shrink-0">
                          {new Date(message.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:bg-white resize-none text-sm transition-all"
              rows={1}
              disabled={sending}
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow flex-shrink-0"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="hidden sm:block text-xs text-gray-400 mt-1.5 ml-1">Enterで送信・Shift+Enterで改行</p>
        </div>
      </div>

      {/* メンバーリスト（右サイドバー） */}
      <div className="hidden sm:flex w-56 border-l border-gray-100 flex-col bg-gray-50">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            メンバー
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {members.map((member) => {
            const displayName = member.profiles.display_name || member.profiles.username
            const isCurrentUser = member.user_id === currentUserId
            return (
              <div
                key={member.id}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors ${
                  isCurrentUser ? 'bg-emerald-50' : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                  {member.profiles.avatar_url ? (
                    <img src={member.profiles.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
                  {isCurrentUser && (
                    <p className="text-xs text-emerald-600">あなた</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}