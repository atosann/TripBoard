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

  console.log('📌 取得する投稿ID:', id);

  // まず基本的な投稿データのみ取得してみる
  const { data: basicPost, error: basicError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (basicError) {
    console.error('❌ 基本投稿取得エラー:', basicError);
    return NextResponse.json(
      { error: '投稿が見つかりません', details: basicError.message },
      { status: 404 }
    );
  }

  if (!basicPost) {
    console.error('❌ 投稿が存在しません');
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }

  console.log('✅ 基本投稿データ取得成功');

  // 次に関連データを取得
  try {
    // 作成者情報を取得
    const { data: author } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('id', basicPost.author_id)
      .single();

    // カテゴリー情報を取得
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('id', basicPost.category_id)
      .single();

    // 参加者数を取得
    const { count: participantCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);

    // データを結合
    const post = {
      ...basicPost,
      author,
      category,
      participants: [{ count: participantCount || 0 }]
    };

    console.log('✅ 全データ取得成功');

    return NextResponse.json({ data: post });
  } catch (err) {
    console.error('❌ 関連データ取得エラー:', err);
    // エラーが出ても基本データだけ返す
    return NextResponse.json({ 
      data: {
        ...basicPost,
        author: null,
        category: null,
        participants: [{ count: 0 }]
      }
    });
  }
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

  // 作成者のみ編集可能
  if (existingPost.author_id !== user.id) {
    return NextResponse.json(
      { error: '編集権限がありません' },
      { status: 403 }
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

  // 投稿を更新
  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update({
      title,
      description,
      category_id,
      latitude,
      longitude,
      event_date,
      max_participants: max_participants || existingPost.max_participants,
      updated_at: new Date().toISOString(),
    })
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

  // 関連データを取得
  const { data: author } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('id', updatedPost.author_id)
    .single();

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('id', updatedPost.category_id)
    .single();

  const { count: participantCount } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id);

  return NextResponse.json({ 
    success: true, 
    data: {
      ...updatedPost,
      author,
      category,
      participants: [{ count: participantCount || 0 }]
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

  // 作成者のみ削除可能
  if (existingPost.author_id !== user.id) {
    return NextResponse.json(
      { error: '削除権限がありません' },
      { status: 403 }
    );
  }

  // 論理削除
  const { error: deleteError } = await supabase
    .from('posts')
    .update({ 
      status: 'deleted',
      is_hidden: true,
      updated_at: new Date().toISOString()
    })
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