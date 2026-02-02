'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { Message } from '@/types/database';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime, isSpam } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  postId: string;
  userId: string;
}

export function ChatBox({ postId, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ChatBox mounted. PostID:', postId, 'UserID:', userId);
    fetchMessages();
    subscribeToMessages();
  }, [postId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    console.log('fetchMessages 開始');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(id, display_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    console.log('fetchMessages 結果:', { data, error });
    if (data) setMessages(data);
  };

  const subscribeToMessages = () => {
    console.log('Realtime購読開始');
    const supabase = createBrowserClient();
    
    const channel = supabase
      .channel(`messages:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          console.log('新しいメッセージを受信:', payload);
          // 新しいメッセージのユーザー情報を取得
          const { data: userData } = await supabase
            .from('users')
            .select('id, display_name')
            .eq('id', payload.new.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              user: userData,
            } as Message,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    console.log('=== handleSendMessage が呼ばれました ===');
    console.log('newMessage:', newMessage);
    console.log('newMessage.trim():', newMessage.trim());
    
    if (!newMessage.trim()) {
      console.log('メッセージが空なので送信中止');
      return;
    }

    // スパムチェック
    if (isSpam(newMessage)) {
      console.log('スパム判定されました');
      alert('不適切な内容が含まれている可能性があります');
      return;
    }

    setLoading(true);
    console.log('送信処理開始...');

    try {
      const supabase = createBrowserClient();
      
      const insertData = {
        post_id: postId,
        user_id: userId,
        content: newMessage.trim(),
      };
      
      console.log('送信するデータ:', insertData);
      
      const { data, error } = await supabase.from('messages').insert(insertData).select();

      console.log('送信結果 data:', data);
      console.log('送信結果 error:', error);

      if (error) {
        console.error('エラー詳細:', error);
        alert('メッセージの送信に失敗しました: ' + error.message);
      } else {
        console.log('送信成功！');
        setNewMessage('');
        // 送信後にメッセージを再取得
        await fetchMessages();
      }
    } catch (err) {
      console.error('予期しないエラー:', err);
      alert('エラーが発生しました: ' + String(err));
    } finally {
      setLoading(false);
      console.log('送信処理完了');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('キー押下:', e.key, 'Shift:', e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white">
      {/* 安全文言 */}
      <div className="bg-blue-50 border-b p-3">
        <p className="text-xs text-blue-800">
          🛡️ 個人的な連絡先の交換は慎重に。金銭の要求や勧誘があった場合はすぐに通報してください。
        </p>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>まだメッセージがありません</p>
            <p className="text-sm mt-2">最初のメッセージを送信しましょう！</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.is_system
                    ? 'bg-gray-100 text-gray-600 text-sm text-center w-full'
                    : message.user_id === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {!message.is_system && (
                  <p className="text-xs opacity-70 mb-1">
                    {message.user?.display_name || 'ユーザー'}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.user_id === userId ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatRelativeTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="メッセージを入力... (Enterで送信)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            maxLength={500}
            className="resize-none"
          />
          <button
            onClick={() => {
              console.log('ボタンがクリックされました');
              handleSendMessage();
            }}
            disabled={loading || !newMessage.trim()}
            className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}