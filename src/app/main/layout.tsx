// app/(main)/layout.tsx
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/MobileNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header />
      
      {/* ハンバーガーメニュー（モバイル・デスクトップ共通） */}
      <MobileNav />
      
      {/* メインコンテンツ */}
      <main className="w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}