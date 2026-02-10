import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const { message } = await request.json()
    const postId = params.id

    // 投稿の存在確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, status')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    // 投稿者本人はチェック不要（UIで制御）
    if (post.user_id === user.id) {
      return NextResponse.json({ error: '自分の投稿には申請できません' }, { status: 400 })
    }

    // 投稿がクローズされていないか確認
    if (post.status !== 'open') {
      return NextResponse.json({ error: 'この投稿は募集を終了しています' }, { status: 400 })
    }

    // 既存の参加状態を確認
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id, status')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingParticipant) {
      if (existingParticipant.status === 'pending') {
        return NextResponse.json({ error: 'すでに参加申請済みです' }, { status: 400 })
      }
      if (existingParticipant.status === 'joined') {
        return NextResponse.json({ error: 'すでに参加しています' }, { status: 400 })
      }
      if (existingParticipant.status === 'rejected') {
        return NextResponse.json({ error: '参加申請が拒否されています' }, { status: 400 })
      }
    }

    // 参加申請を作成
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        post_id: postId,
        user_id: user.id,
        status: 'pending',
        request_message: message || null,
      })
      .select()
      .single()

    if (participantError) {
      console.error('参加申請エラー:', participantError)
      return NextResponse.json({ error: '参加申請に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: participant })
  } catch (error) {
    console.error('参加申請エラー:', error)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
}