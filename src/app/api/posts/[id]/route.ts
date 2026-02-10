// src/app/api/posts/[id]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// 投稿の取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const { id } = await context.params;
  
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

  // 1. 投稿を取得
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    console.error('投稿取得エラー:', error);
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }

  // 2. profilesテーブルからユーザー情報を取得
  let author = null;
  if (post.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', post.user_id)
      .single();
    
    author = profile;
  }

  // 3. 結合して返す
  return NextResponse.json({ 
    data: {
      ...post,
      author
    }
  });
}

// 投稿の更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const { id } = await context.params;
  
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

  // 投稿を取得して権限を確認（user_idを使用）
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingPost) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }

  // 作成者のみ編集可能（user_idで確認）
  if (existingPost.user_id !== user.id) {
    return NextResponse.json(
      { error: '編集権限がありません' },
      { status: 403 }
    );
  }

  // リクエストボディを取得
  const body = await request.json();
  const { 
    title, 
    content, 
    destination, 
    travel_date, 
    max_participants,
    category_id,
    latitude,
    longitude,
    event_date,
    description
  } = body;

  // バリデーション（既存のフィールドに対応）
  if (!title) {
    return NextResponse.json(
      { error: 'タイトルは必須です' },
      { status: 400 }
    );
  }

  // スパムチェック（簡易版）
  const spamKeywords = ['副業', '稼げる', '投資', 'LINE', 'DM', '出会い'];
  const textContent = (title + ' ' + (content || description || '')).toLowerCase();
  const hasSpam = spamKeywords.some(keyword => textContent.includes(keyword.toLowerCase()));
  
  if (hasSpam) {
    return NextResponse.json(
      { error: '不適切なキーワードが含まれています' },
      { status: 400 }
    );
  }

  // 更新するデータを準備
  const updateData: any = {
    title,
    updated_at: new Date().toISOString(),
  };

  // 既存のフィールドに基づいて更新
  if (content !== undefined) updateData.content = content;
  if (description !== undefined) updateData.description = description;
  if (destination !== undefined) updateData.destination = destination;
  if (travel_date !== undefined) updateData.travel_date = travel_date;
  if (event_date !== undefined) updateData.event_date = event_date;
  if (max_participants !== undefined) updateData.max_participants = max_participants;
  if (category_id !== undefined) updateData.category_id = category_id;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;

  // 投稿を更新
  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    console.error('投稿更新エラー:', updateError);
    return NextResponse.json(
      { error: '投稿の更新に失敗しました: ' + updateError.message },
      { status: 500 }
    );
  }

  // profilesテーブルからユーザー情報を取得
  let author = null;
  if (updatedPost.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', updatedPost.user_id)
      .single();
    
    author = profile;
  }

  return NextResponse.json({ 
    success: true, 
    data: {
      ...updatedPost,
      author
    }
  });
}

// 投稿の削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const { id } = await context.params;
  
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

  // 投稿を取得して権限を確認
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingPost) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }

  // 作成者のみ削除可能（user_idで確認）
  if (existingPost.user_id !== user.id) {
    return NextResponse.json(
      { error: '削除権限がありません' },
      { status: 403 }
    );
  }

  // 論理削除または物理削除
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('投稿削除エラー:', deleteError);
    return NextResponse.json(
      { error: '投稿の削除に失敗しました: ' + deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true,
    message: '投稿を削除しました' 
  });
}