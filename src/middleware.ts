import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 関数名を middleware から proxy に変更
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // セッションチェック（軽量）
  const { data: { session } } = await supabase.auth.getSession()

  // 認証が必要なパス
  const isProtectedPath = request.nextUrl.pathname.startsWith('/main')
  
  // 認証ページへのアクセス
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth')

  // 未ログインで保護されたページにアクセス
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ログイン済みで認証ページにアクセス
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/main/posts', request.url))
  }

  return response
}

export const config = {
  matcher: ['/main/:path*', '/auth/:path*'],
}