import Link from 'next/link'

export default function PrivacyPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">みんなのメンバー募集掲示板 プライバシーポリシー</h2>
            <p className="text-emerald-50 text-sm mt-1">最終更新: 2025年1月1日</p>
          </div>

          <div className="bg-white px-6 py-8 space-y-8">

            <p className="text-gray-700 leading-relaxed">
              みんなのメンバー募集掲示板（以下「本サービス」）は、利用者のプライバシーを尊重し、個人情報を適切に管理します。本ポリシーは、収集する情報の種類・利用目的・管理方法について説明します。
            </p>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                収集する情報
              </h3>
              <p className="text-gray-600 text-sm pl-9 mb-2">以下の情報をサービス提供のために収集します。</p>
              <ul className="pl-9 space-y-2 text-gray-700">
                {[
                  'メールアドレス（アカウント認証・通知用）',
                  '表示名・自己紹介・プロフィール画像（任意）',
                  '居住エリア（都道府県レベル）',
                  '投稿内容・チャットメッセージ',
                  'アクセスログ・IPアドレス（不正利用防止用）',
                  'Cookieおよび類似技術による利用状況データ',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-sm pl-9 mt-3">
                ※ 性別・年齢などのセンシティブ情報は収集しません。位置情報は投稿時に都道府県レベルでのみ使用します。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                利用目的
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                {[
                  'アカウント管理・本人確認',
                  'サービスの提供・運営・改善',
                  'スパム・不正利用・規約違反の検知と対応',
                  'お問い合わせへの対応',
                  'サービスに関する重要なお知らせの送信',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                第三者提供
              </h3>
              <p className="text-gray-700 pl-9 mb-3">
                収集した個人情報は、以下の場合を除き第三者に提供しません。
              </p>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>利用者本人の同意がある場合</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>法令に基づき開示が必要な場合</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>人の生命・身体・財産の保護のために必要な場合</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>サービス運営に必要な業務委託先（Supabase等）への提供（守秘義務契約を締結）</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                データの保存・削除
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>データはSupabase（米国）のサーバーに暗号化して保存されます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>アカウント削除時に、投稿・メッセージ・プロフィール情報を削除します。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>通報・違反調査中のデータは調査完了まで保全されます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>アクセスログは不正利用防止のため一定期間保存されます。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                Cookie（クッキー）の利用
              </h3>
              <p className="text-gray-700 pl-9 mb-3">
                本サービスではログイン状態の維持・利用状況の分析のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、その場合一部機能が利用できなくなります。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                利用者の権利
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>ご自身の個人情報の開示・訂正・削除を請求できます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>アカウント設定からプロフィール情報をいつでも変更・削除できます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>お問い合わせは下記の連絡先にご連絡ください。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                ポリシーの変更
              </h3>
              <p className="text-gray-700 pl-9">
                本ポリシーは必要に応じて変更します。重要な変更はサービス内でお知らせします。継続利用をもって変更に同意したものとみなします。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                お問い合わせ
              </h3>
              <p className="text-gray-700 pl-9">
                個人情報の取り扱いに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}