// src/app/main/posts/[id]/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JoinPostButton } from '@/components/posts/JoinPostButton';
import OpenChatButton from '@/components/posts/OpenChatButton';
import { ChatBox } from '@/components/chat/ChatBox';
import { DeletePostButton } from '@/components/posts/DeletePostButton';

export default async function PostDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // params を await で取得
  const { id } = await params;
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Componentからset呼び出しは無視
          }
        },
      },
    }
  );
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // 投稿を取得（デバッグ情報付き）
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:author_id (
        display_name
      ),
      categories (
        name,
        icon
      )
    `)
    .eq('id', id)
    .single();
  
  // デバッグ出力（ターミナルに表示）
  console.log('=== デバッグ情報 ===');
  console.log('取得した投稿ID:', id);
  console.log('投稿データ:', post);
  console.log('エラー:', error);
  console.log('===================');
  
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-red-600 mb-4">⚠️ 投稿が見つかりません</h1>
          
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold mb-2">検索したID:</p>
              <p className="text-sm font-mono text-gray-700">{id}</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="font-semibold text-red-700 mb-2">エラー詳細:</p>
                <p className="text-sm text-red-600">{error.message}</p>
                <p className="text-xs text-gray-600 mt-2">コード: {error.code}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="font-semibold text-blue-700 mb-2">💡 確認事項:</p>
              <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
                <li>Supabase Table Editor で posts テーブルを確認してください</li>
                <li>このIDの投稿が存在するか確認してください</li>
                <li>is_hidden が false になっているか確認してください</li>
                <li>status が 'open' になっているか確認してください</li>
              </ul>
            </div>
            
            <div className="pt-4">
              <a 
                href="/main/posts"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                ← 投稿一覧に戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 参加状況を確認
  const { data: participation } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .single();
  
  // 参加者数を取得
  const { count: participantCount } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)
    .eq('status', 'joined');
  
  // 投稿者かどうか判定
  const isAuthor = post.author_id === user.id;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 投稿詳細 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.description}</p>
        
        {/* カテゴリ・日時など */}
        <div className="flex gap-4 text-sm text-gray-600 mb-6">
          {post.categories && (
            <span>{post.categories.icon} {post.categories.name}</span>
          )}
          <span>📅 {new Date(post.event_date).toLocaleDateString('ja-JP')}</span>
          <span>📍 {post.location_name}</span>
        </div>
        
        {/* ボタン部分 - 投稿者かどうかで切り替え */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              {isAuthor ? (
                // 投稿者の場合: グループチャットボタン
                <OpenChatButton 
                  postId={id} 
                  participantCount={participantCount || 1}
                />
              ) : participation?.status === 'joined' ? (
                // 既に参加済みの場合: グループチャットボタン
                <OpenChatButton 
                  postId={id} 
                  participantCount={participantCount || 1}
                />
              ) : (
                // まだ参加していない場合: 参加ボタン
                <JoinPostButton postId={id} />
              )}
            </div>
            
            {/* 削除ボタン（投稿者のみ表示） */}
            <DeletePostButton postId={id} isAuthor={isAuthor} />
          </div>
        </div>
      </div>
      
      {/* グループチャット（投稿者 or 参加者のみ表示） */}
      {(isAuthor || participation?.status === 'joined') && (
        <div id="group-chat" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">💬 グループチャット</h2>
          <ChatBox postId={id} userId={user.id} />
        </div>
      )}
    </div>
  );
}