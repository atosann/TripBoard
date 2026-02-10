// src/app/api/participation-requests/[id]/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

// 申請を承認・拒否
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const status: string = body.status // 'approved' or 'rejected'
    
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 申請情報を取得
    const { data: requestData, error: requestError } = await supabase
      .from('participation_requests')
      .select(`
        *,
        posts(id, author_id, title),
        profiles:requester_id(username, email)
      `)
      .eq('id', id)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json({ error: '申請が見つかりません' }, { status: 404 })
    }

    // 投稿者のみ承認・拒否できる
    if (requestData.posts.author_id !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // ステータスを更新
    const { data: updatedRequest, error: updateError } = await supabase
      .from('participation_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('ステータス更新エラー:', updateError)
      return NextResponse.json({ error: 'ステータスの更新に失敗しました' }, { status: 500 })
    }

    // 承認された場合はグループチャットに追加（トリガーで自動実行される）
    // メール通知を送信
    if (status === 'approved' || status === 'rejected') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-approval-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: requestData.profiles.email,
            postTitle: requestData.posts.title,
            status: status,
            postId: requestData.post_id
          })
        })
      } catch (emailError) {
        console.error('メール送信エラー:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      request: updatedRequest,
      message: status === 'approved' ? '参加を承認しました' : '参加を拒否しました'
    })

  } catch (error) {
    console.error('申請更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}