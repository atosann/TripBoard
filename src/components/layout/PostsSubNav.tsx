'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PostsSubNav() {
  const pathname = usePathname();

  const subNavItems = [
    { href: '/main/posts', label: 'すべての投稿' },
    { href: '/main/posts/my-posts', label: '自分の投稿' },
    { href: '/main/posts/participating', label: '参加中の投稿' },
  ];

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto py-2">
          {subNavItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}