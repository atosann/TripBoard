// src/app/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import MainPage from './main/page' // /main の既存ページをそのまま流用

export default async function RootPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // ログイン済みなら /main/top へ
  if (session) {
    redirect('/main/top')
  }

  // 未ログインは /main のページをそのまま表示
  return <MainPage />
}