import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies()
    const supabase = await createServerClient()

    // ユーザー認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { action, participantId } = await request.json() // participantIdをリクエストボディから取得
    const { id: postId } = await params

    // 投稿の所有者確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // 参加者情報を取得
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, user_id, status')
      .eq('id', participantId)
      .eq('post_id', postId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: '参加申請が見つかりません' }, { status: 404 })
    }

    if (participant.status !== 'pending') {
      return NextResponse.json({ error: 'この申請はすでに処理されています' }, { status: 400 })
    }

    // ステータス更新
    const newStatus = action === 'approve' ? 'joined' : 'rejected'
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)

    if (updateError) {
      console.error('ステータス更新エラー:', updateError)
      return NextResponse.json({ error: 'ステータス更新に失敗しました' }, { status: 500 })
    }

    // 承認時にシステムメッセージを投稿
    if (action === 'approve') {
      const { data: approvedUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', participant.user_id)
        .single()

      const username = approvedUser?.username || 'ユーザー'

      await supabase.from('messages').insert({
        post_id: postId,
        user_id: user.id,
        content: `${username}さんが参加しました`,
        is_system: true,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('参加申請処理エラー:', error)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
}