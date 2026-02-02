// src/app/api/posts/[id]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// 投稿削除
export async function DELETE(
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
  
  // 投稿を取得
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();
  
  if (postError || !post) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }
  
  // 投稿者本人かチェック
  if (post.author_id !== user.id) {
    return NextResponse.json(
      { error: '自分の投稿のみ削除できます' },
      { status: 403 }
    );
  }
  
  // 投稿を削除（CASCADE設定で関連データも自動削除される）
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  
  if (deleteError) {
    console.error('削除エラー:', deleteError);
    return NextResponse.json(
      { error: '削除に失敗しました: ' + deleteError.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, message: '投稿を削除しました' });
}

// 投稿詳細取得
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
  
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, display_name),
      category:categories(id, name, icon),
      participants:participants(count)
    `)
    .eq('id', postId)
    .single();
  
  if (error || !post) {
    return NextResponse.json(
      { error: '投稿が見つかりません' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ data: post });
}