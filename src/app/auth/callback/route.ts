import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // メール確認後、プロフィールを作成
      const metadata = data.user.user_metadata
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: metadata.display_name,
        age_range: metadata.age_range,
        gender: metadata.gender,
        bio: metadata.bio || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
    }
  }

  // 認証完了後、メインページへリダイレクト
  return NextResponse.redirect(new URL('/main/posts', request.url))
}