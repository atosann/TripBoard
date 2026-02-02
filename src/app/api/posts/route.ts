// src/app/api/posts/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { postRateLimit } from '@/lib/rate-limit';

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
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'ログインが必要です' },
      { status: 401 }
    );
  }

  // ⭐ レート制限チェック
  const { success, limit, remaining, reset } = await postRateLimit.limit(user.id);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: '投稿制限に達しました。1時間後にお試しください。',
        limit,
        remaining,
        reset: new Date(reset).toLocaleString('ja-JP')
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }
  
  // リクエストボディを取得
  const body = await request.json();
  const { title, description, category_id, latitude, longitude, event_date, max_participants } = body;
  
  // バリデーション
  if (!title || !description || !category_id || !latitude || !longitude || !event_date) {
    return NextResponse.json(
      { error: '必須項目が不足しています' },
      { status: 400 }
    );
  }
  
  // スパムチェック（簡易版）
  const spamKeywords = ['副業', '稼げる', '投資', 'LINE', 'DM', '出会い'];
  const content = (title + ' ' + description).toLowerCase();
  const hasSpam = spamKeywords.some(keyword => content.includes(keyword.toLowerCase()));
  
  if (hasSpam) {
    return NextResponse.json(
      { error: '不適切なキーワードが含まれています' },
      { status: 400 }
    );
  }
  
  // 投稿を作成
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title,
      description,
      category_id,
      latitude,
      longitude,
      event_date,
      max_participants: max_participants || 10,
      status: 'open',
    })
    .select()
    .single();
  
  if (error) {
    console.error('投稿作成エラー:', error);
    return NextResponse.json(
      { error: '投稿の作成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
  
  // 作成者を自動的に参加者として登録
  await supabase
    .from('participants')
    .insert({
      post_id: post.id,
      user_id: user.id,
      status: 'joined',
    });
  
  return NextResponse.json({ 
    success: true, 
    data: post,
    rateLimit: {
      remaining,
      reset: new Date(reset).toLocaleString('ja-JP')
    }
  });
}

// 投稿一覧取得（レート制限なし）
export async function GET(request: NextRequest) {
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
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, display_name),
      category:categories(id, name, icon),
      participants:participants(count)
    `)
    .eq('status', 'open')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    return NextResponse.json(
      { error: 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ data: posts });
}