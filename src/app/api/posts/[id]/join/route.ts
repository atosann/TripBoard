// src/app/api/posts/[id]/join/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'ログインが必要です' },
      { status: 401 }
    );
  }
  
  // リクエストボディを取得
  const body = await request.json();
  const { hasAgreed } = body;
  
  // 過去に参加したことがあるかチェック
  const { data: pastParticipations } = await supabase
    .from('participants')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);
  
  const isFirstTime = !pastParticipations || pastParticipations.length === 0;
  
  // 初回参加で同意していない場合
  if (isFirstTime && !hasAgreed) {
    return NextResponse.json(
      { error: '初回参加時の同意が必要です', isFirstTime: true },
      { status: 400 }
    );
  }
  
  // 投稿が存在するか確認
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();
  
  if (postError || !post) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }
  
  // 既に参加しているか確認
  const { data: existing } = await supabase
    .from('participants')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();
  
  if (existing) {
    return NextResponse.json(
      { error: '既に参加しています' },
      { status: 400 }
    );
  }
  
  // 参加者として登録
  const { data, error } = await supabase
    .from('participants')
    .insert({
      post_id: postId,
      user_id: user.id,
      status: 'joined',
    })
    .select()
    .single();
  
  if (error) {
    console.error('参加エラー:', error);
    return NextResponse.json(
      { error: '参加に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, data });
}