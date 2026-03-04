// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isMainLanding = pathname === '/main'

  const handleLogoClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    router.push(user ? '/main/top' : '/main')
  }

  // /main ページ用：ロゴ＋登録/ログインボタン
  if (isMainLanding) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 h-16">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-3 items-center h-full">
            {/* 左側（空白） */}
            <div />

            {/* ロゴ＋タイトル（中央） */}
            <Link href="/main" onClick={handleLogoClick} className="flex items-center gap-2 md:gap-3 justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">みんなのメンバー募集掲示板</span>
                <span className="sm:hidden">メンバー募集</span>
              </h1>
            </Link>

            {/* 登録／ログインボタン */}
            <div className="flex gap-2 md:gap-3 items-center justify-end">
              <Link
                href="/auth/login"
                className="text-emerald-600 border border-emerald-500 hover:bg-emerald-50 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold transition-all text-sm md:text-base"
              >
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                無料登録
              </Link>
            </div>
          </div>
        </div>
      </header>
    )
  }

  // その他のページ：従来のヘッダー
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-3 items-center h-full">
          {/* 左側（空白） */}
          <div />

          {/* ロゴ＋タイトル（中央） */}
          <Link href="/main" onClick={handleLogoClick} className="flex items-center gap-2 md:gap-3 justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">みんなのメンバー募集掲示板</span>
              <span className="sm:hidden">メンバー募集</span>
            </h1>
          </Link>

          {/* メニュー */}
          <div className="flex gap-4 items-center justify-end">
            <Link
              href="/main/posts/create"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base"
            >
              投稿を作成
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}