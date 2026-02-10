'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, List, PlusCircle, User, FileText, Users, Search } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/main', 
      label: 'トップページ', 
      icon: Home 
    },
    { 
      href: '/main/search', 
      label: '投稿を探す', 
      icon: Search 
    },
    { 
      href: '/main/all-posts', 
      label: 'すべての投稿', 
      icon: List 
    },
    { 
      href: '/main/my-posts', 
      label: '自分の投稿', 
      icon: FileText 
    },
    { 
      href: '/main/joined', 
      label: '参加中の投稿', 
      icon: Users 
    },
    { 
      href: '/main/posts/create', 
      label: '投稿作成', 
      icon: PlusCircle 
    },
    { 
      href: '/main/profile', 
      label: 'プロフィール', 
      icon: User 
    },
  ];

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/main" className="text-xl font-bold text-blue-600">
            Trip Board
          </Link>
          
          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* ログアウトボタン */}
          <form action="/auth/logout" method="POST">
            <Button type="submit" variant="outline" size="sm">
              ログアウト
            </Button>
          </form>
        </div>

        {/* モバイルメニュー（横スクロール） */}
        <div className="md:hidden pb-3 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}