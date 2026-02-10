// src/app/api/participation-requests/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const postId: string = body.postId
    const message: string = body.message || ''
    
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

    // 投稿情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*, profiles:author_id(email, username)')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    // 自分の投稿には申請できない
    if (post.author_id === user.id) {
      return NextResponse.json({ error: '自分の投稿には参加申請できません' }, { status: 400 })
    }

    // 既存の申請をチェック
    const { data: existingRequest } = await supabase
      .from('participation_requests')
      .select('*')
      .eq('post_id', postId)
      .eq('requester_id', user.id)
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: 'すでに参加申請済みです' }, { status: 400 })
    }

    // 参加申請を作成
    const { data: participationRequest, error: requestError } = await supabase
      .from('participation_requests')
      .insert({
        post_id: postId,
        requester_id: user.id,
        message: message,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      console.error('申請作成エラー:', requestError)
      return NextResponse.json({ error: '申請の送信に失敗しました' }, { status: 500 })
    }

    // 申請者情報を取得
    const { data: requester } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', user.id)
      .single()

    // メール通知を送信
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-notification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: post.profiles.email,
          postTitle: post.title,
          requesterName: requester?.username || '匿名ユーザー',
          message: message,
          postId: postId,
          requestId: participationRequest.id
        })
      })

      if (!emailResponse.ok) {
        console.error('メール送信に失敗しました')
      }
    } catch (emailError) {
      console.error('メール送信エラー:', emailError)
      // メール送信失敗してもリクエストは成功扱い
    }

    return NextResponse.json({ 
      success: true, 
      request: participationRequest,
      message: '参加申請を送信しました' 
    })

  } catch (error) {
    console.error('参加申請エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// 自分の申請一覧を取得
export async function GET() {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data: requests, error } = await supabase
      .from('participation_requests')
      .select(`
        *,
        posts(id, title, event_date, location_name),
        profiles:requester_id(username, avatar_url)
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('申請取得エラー:', error)
      return NextResponse.json({ error: '申請の取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ requests })

  } catch (error) {
    console.error('申請取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}