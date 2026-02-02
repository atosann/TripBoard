export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. 収集する情報</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>メールアドレス（認証用）</li>
              <li>表示名、自己紹介、居住エリア（市区町村レベル）</li>
              <li>投稿内容、メッセージ内容</li>
              <li>位置情報（投稿時のみ、ぼかして表示）</li>
              <li>IPアドレス（不正利用防止用）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 利用目的</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>サービスの提供・運営</li>
              <li>不正利用・スパムの検知と防止</li>
              <li>サービス改善のための統計分析</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 第三者提供</h2>
            <p className="text-gray-700 mb-4">
              原則として第三者に提供しません。ただし以下の場合を除きます：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護に必要な場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. データ削除</h2>
            <p className="text-gray-700">
              アカウント削除時に投稿・メッセージ等も削除されます。ただし、通報・違反調査中のデータは保全されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookie（クッキー）</h2>
            <p className="text-gray-700">
              本サービスでは、ユーザーの利便性向上のためCookieを使用しています。Cookieを無効にした場合、一部機能が利用できなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. お問い合わせ</h2>
            <p className="text-gray-700">
              プライバシーポリシーに関するお問い合わせは、サービス内の通報機能またはお問い合わせフォームからご連絡ください。
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12 pt-8 border-t">
            最終更新: 2024年1月1日
          </p>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            トップページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}