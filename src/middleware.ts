import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  const { data: { session } } = await supabase.auth.getSession()

  const isProtectedPath = request.nextUrl.pathname.startsWith('/main') &&
                          request.nextUrl.pathname !== '/main'
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth')
  const isRootPath = request.nextUrl.pathname === '/'

  if (isRootPath) {
    return NextResponse.redirect(new URL('/main', request.url))
  }

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/main/top', request.url))
  }

  return response
}

export const config = {
  matcher: ['/main/:path*', '/auth/:path*', '/'],
}