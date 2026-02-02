// src/app/api/reports/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { reportRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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

  // ⭐ レート制限チェック (10件/日)
  const { success, limit, remaining, reset } = await reportRateLimit.limit(user.id);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: '通報制限に達しました。明日お試しください。',
        limit,
        remaining,
        reset: new Date(reset).toLocaleString('ja-JP')
      },
      { status: 429 }
    );
  }
  
  // リクエストボディを取得
  const body = await request.json();
  const { target_type, target_id, reason, details } = body;
  
  // バリデーション
  if (!target_type || !target_id || !reason) {
    return NextResponse.json(
      { error: '必須項目が不足しています' },
      { status: 400 }
    );
  }
  
  if (!['post', 'message', 'user'].includes(target_type)) {
    return NextResponse.json(
      { error: '不正な通報対象です' },
      { status: 400 }
    );
  }
  
  // 重複通報チェック（24時間以内）
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single();
  
  if (existing) {
    return NextResponse.json(
      { error: 'この対象は既に通報済みです（24時間以内）' },
      { status: 400 }
    );
  }
  
  // 通報を作成
  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type,
      target_id,
      reason,
      details: details || null,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) {
    console.error('通報作成エラー:', error);
    return NextResponse.json(
      { error: '通報の送信に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
  
  // 対象を一時非表示にする
  if (target_type === 'post') {
    await supabase
      .from('posts')
      .update({ is_hidden: true })
      .eq('id', target_id);
  } else if (target_type === 'message') {
    await supabase
      .from('messages')
      .update({ is_hidden: true })
      .eq('id', target_id);
  }
  
  return NextResponse.json({ 
    success: true, 
    data: report,
    message: '通報を受け付けました。運営が確認いたします。',
    rateLimit: {
      remaining,
      reset: new Date(reset).toLocaleString('ja-JP')
    }
  });
}