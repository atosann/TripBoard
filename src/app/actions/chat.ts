// app/actions/chat.ts
'use server';

import { createServerClient } from '@/lib/supabase-server';

export async function ensureChatRoomExists(postId: string) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ ユーザー認証エラー:', userError);
      throw new Error('認証が必要です');
    }

    console.log('✅ 認証成功 - UserID:', user.id);
    console.log('📝 チャットルーム確認開始 - PostID:', postId);

    // 既存のチャットルームを確認
    const { data: existingRoom, error: selectError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('post_id', postId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ チャットルーム検索エラー:', selectError);
      throw selectError;
    }

    if (existingRoom) {
      console.log('✅ 既存のチャットルームが見つかりました:', existingRoom.id);
      
      // メンバーとして追加（既に存在する場合はスキップ）
      await supabase
        .from('chat_room_members')
        .upsert({
          chat_room_id: existingRoom.id,
          user_id: user.id,
        }, { onConflict: 'chat_room_id,user_id' });
      
      return { success: true, chatRoomId: existingRoom.id };
    }

    console.log('📝 チャットルームが存在しないため、新規作成を試みます');

    // 投稿情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('❌ 投稿取得エラー:', postError);
      throw new Error('投稿が見つかりません');
    }

    console.log('📌 投稿情報 - 投稿者ID:', post.author_id, '現在のユーザー:', user.id);

    if (!post.author_id) {
      console.error('❌ この投稿のauthor_idがnullです');
      throw new Error('投稿データが不完全です');
    }

    if (post.author_id !== user.id) {
      console.error('❌ 権限エラー: 投稿者ではありません');
      throw new Error('チャットルームを作成する権限がありません');
    }

    // 新しいチャットルームを作成
    console.log('📝 新しいチャットルームを作成します...');
    const { data: newRoom, error: insertError } = await supabase
      .from('chat_rooms')
      .insert({
        post_id: postId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ チャットルーム作成エラー:', insertError);
      throw insertError;
    }

    // 投稿者をメンバーとして追加
    await supabase
      .from('chat_room_members')
      .insert({
        chat_room_id: newRoom.id,
        user_id: user.id,
      });

    console.log('✅ チャットルーム作成成功:', newRoom.id);
    return { success: true, chatRoomId: newRoom.id };

  } catch (error) {
    console.error('❌ チャットルーム作成エラー:', error);
    throw error;
  }
}