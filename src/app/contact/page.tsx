// src/app/contact/page.tsx
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                トップへ戻る
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">お問い合わせ</h2>
            <p className="text-emerald-50 text-sm mt-1">ご質問・ご要望・不具合報告などお気軽にどうぞ</p>
          </div>

          <div className="bg-white px-6 py-8 space-y-6">

            {/* お問い合わせ種別 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">選択してください</option>
                <option value="bug">不具合・バグの報告</option>
                <option value="abuse">迷惑ユーザー・違反投稿の報告</option>
                <option value="account">アカウントに関する問題</option>
                <option value="feature">機能のご要望</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="example@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">返信先のメールアドレスを入力してください</p>
            </div>

            {/* 件名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="お問い合わせの件名"
              />
            </div>

            {/* 本文 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                placeholder="お問い合わせ内容を詳しくご記入ください"
              />
              <p className="text-xs text-gray-500 mt-1">0/1000文字</p>
            </div>

            {/* 注意事項 */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                ご注意
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span>返信まで数日かかる場合があります。</li>
                <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span>利用者間のトラブルへの仲裁・介入は行っておりません。</li>
                <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span>緊急の場合は警察等の公的機関にご相談ください。</li>
              </ul>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              送信する
            </button>

          </div>
        </div>
      </main>
    </div>
  )
}