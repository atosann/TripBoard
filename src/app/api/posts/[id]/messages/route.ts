// src/app/api/posts/[id]/messages/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { messageRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
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
            // Server Componentからは無視
          }
        },
      },
    }
  );
  
  // ユーザー取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'ログインが必要です' },
      { status: 401 }
    );
  }

  // ⭐ レート制限チェック (30件/分)
  const { success, limit, remaining, reset } = await messageRateLimit.limit(user.id);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: 'メッセージ送信制限に達しました。1分後にお試しください。',
        limit,
        remaining,
        reset: new Date(reset).toLocaleString('ja-JP')
      },
      { status: 429 }
    );
  }
  
  // 参加者かどうか確認
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('status', 'joined')
    .single();
  
  if (!participant) {
    return NextResponse.json(
      { error: 'この投稿に参加していません' },
      { status: 403 }
    );
  }
  
  // メッセージ内容を取得
  const body = await request.json();
  const { content } = body;
  
  if (!content || content.trim().length === 0) {
    return NextResponse.json(
      { error: 'メッセージを入力してください' },
      { status: 400 }
    );
  }
  
  if (content.length > 1000) {
    return NextResponse.json(
      { error: 'メッセージは1000文字以内にしてください' },
      { status: 400 }
    );
  }
  
  // スパムチェック
  const spamKeywords = ['副業', '稼げる', '投資', 'LINE', 'DM', '出会い'];
  const hasSpam = spamKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
  
  if (hasSpam) {
    return NextResponse.json(
      { error: '不適切なキーワードが含まれています' },
      { status: 400 }
    );
  }
  
  // メッセージを作成
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      *,
      user:users!messages_user_id_fkey(id, display_name)
    `)
    .single();
  
  if (error) {
    console.error('メッセージ送信エラー:', error);
    return NextResponse.json(
      { error: 'メッセージ送信に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ 
    success: true, 
    data: message,
    rateLimit: {
      remaining,
      reset: new Date(reset).toLocaleString('ja-JP')
    }
  });
}

// メッセージ一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
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
            // Server Componentからは無視
          }
        },
      },
    }
  );
  
  // ユーザー取得
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'ログインが必要です' },
      { status: 401 }
    );
  }
  
  // 参加者かどうか確認
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('status', 'joined')
    .single();
  
  if (!participant) {
    return NextResponse.json(
      { error: 'この投稿に参加していません' },
      { status: 403 }
    );
  }
  
  // メッセージ取得
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      user:users!messages_user_id_fkey(id, display_name)
    `)
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });
  
  if (error) {
    return NextResponse.json(
      { error: 'メッセージ取得に失敗しました' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ data: messages });
}