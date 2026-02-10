// src/app/auth/verified/page.tsx
'use client';

import Link from 'next/link'

export default function VerifiedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 成功カード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* 成功アイコン */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            メールアドレスが認証されました！
          </h1>

          {/* 説明 */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            アカウントの設定が完了しました。<br />
            ログインして散策仲間を見つけましょう！
          </p>

          {/* ログインボタン */}
          <Link
            href="/auth/login"
            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ログインする
          </Link>

          {/* 補足情報 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              ✨ 登録時のメールアドレスとパスワードでログインできます
            </p>
          </div>
        </div>

        {/* 追加情報 */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-emerald-800">
              <p className="font-semibold mb-1">次のステップ</p>
              <ul className="space-y-1 text-emerald-700">
                <li>• プロフィールを充実させる</li>
                <li>• 散策投稿を探す</li>
                <li>• 自分の投稿を作成する</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* アニメーション用CSS */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}