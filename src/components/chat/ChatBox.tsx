'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { Message } from '@/types/database';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime, isSpam } from '@/lib/utils';
import { Send, Lock } from 'lucide-react';

interface ChatBoxProps {
  postId: string;
  userId: string;
}

export function ChatBox({ postId, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ChatBox mounted. PostID:', postId, 'UserID:', userId);
    checkAuthorization();
  }, [postId, userId]);

  useEffect(() => {
    if (isAuthorized) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [postId, isAuthorized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 承認状態をチェック
  const checkAuthorization = async () => {
    console.log('=== 承認状態チェック開始 ===');
    const supabase = createBrowserClient();
    
    try {
      // 認証状態を確認
      const { data: { session } } = await supabase.auth.getSession();
      console.log('現在のセッション:', session?.user?.id);
      
      if (!session) {
        console.error('セッションが存在しません');
        setIsAuthorized(false);
        setAuthCheckLoading(false);
        return;
      }

      // 投稿者かどうかを確認
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (postError) {
        console.error('投稿取得エラー:', postError);
      }

      console.log('投稿情報:', post);
      console.log('投稿者ID:', post?.author_id, '現在のユーザーID:', userId);

      if (post?.author_id === userId) {
        console.log('✅ 投稿者なのでアクセス許可');
        setIsAuthorized(true);
        setAuthCheckLoading(false);
        return;
      }

      // 参加者として承認されているかを確認
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('status')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (participantError) {
        console.log('参加者取得エラー:', participantError);
      }

      console.log('参加者情報:', participant);
      
      const authorized = participant?.status === 'joined';
      console.log('参加者の承認状態:', participant?.status, 'アクセス許可:', authorized);
      setIsAuthorized(authorized);
    } catch (error) {
      console.error('承認チェック予期しないエラー:', error);
      setIsAuthorized(false);
    } finally {
      setAuthCheckLoading(false);
      console.log('=== 承認状態チェック完了 ===');
    }
  };

  const fetchMessages = async () => {
    console.log('=== fetchMessages 開始 ===');
    const supabase = createBrowserClient();
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:users(id, display_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('メッセージ取得エラー:', error);
        return;
      }

      console.log('取得したメッセージ数:', data?.length);
      if (data) setMessages(data);
    } catch (error) {
      console.error('fetchMessages 予期しないエラー:', error);
    }
    console.log('=== fetchMessages 完了 ===');
  };

  const subscribeToMessages = () => {
    console.log('=== Realtime購読開始 ===');
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
          console.log('🔔 新しいメッセージを受信:', payload);
          
          try {
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
          } catch (error) {
            console.error('ユーザー情報取得エラー:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime購読状態:', status);
      });

    return () => {
      console.log('=== Realtime購読解除 ===');
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    console.log('=== handleSendMessage 開始 ===');
    console.log('newMessage:', newMessage);
    console.log('newMessage.trim():', newMessage.trim());
    
    if (!newMessage.trim()) {
      console.log('❌ メッセージが空なので送信中止');
      return;
    }

    // 承認チェック
    if (!isAuthorized) {
      console.log('❌ 承認されていません');
      alert('チャットにアクセスする権限がありません');
      return;
    }

    // スパムチェック
    if (isSpam(newMessage)) {
      console.log('❌ スパム判定されました');
      alert('不適切な内容が含まれている可能性があります');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      // 認証状態を再確認
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📝 送信時の認証状態:');
      console.log('  - セッションユーザーID:', session?.user?.id);
      console.log('  - コンポーネントuserID:', userId);
      console.log('  - 一致:', session?.user?.id === userId);
      
      if (!session) {
        console.error('❌ セッションが存在しません');
        alert('ログインセッションが切れています。再ログインしてください。');
        setLoading(false);
        return;
      }

      const insertData = {
        post_id: postId,
        user_id: userId,
        content: newMessage.trim(),
      };
      
      console.log('📤 送信するデータ:', insertData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(insertData)
        .select();

      console.log('📥 送信結果:');
      console.log('  - data:', data);
      console.log('  - error:', error);

      if (error) {
        console.error('❌ 送信エラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // エラーコード別の対処
        if (error.code === '42501') {
          alert('データベースへのアクセス権限がありません。管理者に連絡してください。\n\nエラーコード: 42501');
        } else {
          alert(`メッセージの送信に失敗しました\n\nエラー: ${error.message}`);
        }
      } else {
        console.log('✅ 送信成功！');
        setNewMessage('');
        // 送信後にメッセージを再取得（Realtimeで受信するまでの保険）
        await fetchMessages();
      }
    } catch (err) {
      console.error('❌ 予期しないエラー:', err);
      alert('エラーが発生しました: ' + String(err));
    } finally {
      setLoading(false);
      console.log('=== handleSendMessage 完了 ===');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('⌨️ Enterキーで送信');
      handleSendMessage();
    }
  };

  // 承認チェック中
  if (authCheckLoading) {
    return (
      <div className="flex flex-col h-[500px] border rounded-lg bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // アクセス権限がない場合
  if (!isAuthorized) {
    return (
      <div className="flex flex-col h-[500px] border rounded-lg bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">チャットにアクセスできません</p>
            <p className="text-sm">
              投稿者に参加申請を承認されると、チャットに参加できます
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {newMessage.length}/500文字
        </p>
      </div>
    </div>
  );
}