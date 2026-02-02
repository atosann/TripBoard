export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. サービス概要</h2>
            <p className="text-gray-700 leading-relaxed">
              本サービス（以下「Trip Board」）は、近場散策・日帰り旅行の参加者募集を目的とした掲示板およびグループチャット機能を提供します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 利用条件</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>18歳以上の方がご利用いただけます。</li>
              <li>1人1アカウントまでとします。</li>
              <li>虚偽の情報を登録しないでください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 禁止事項</h2>
            <p className="text-gray-700 mb-4">以下の行為を禁止します：</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>商業目的の勧誘、マルチ商法、ネットワークビジネスへの勧誘</li>
              <li>出会い目的、わいせつな内容の投稿</li>
              <li>他人へのなりすまし、誹謗中傷、ハラスメント</li>
              <li>スパム投稿、連続投稿</li>
              <li>個人情報（住所、電話番号など）の無断公開</li>
              <li>公共の場以外での集合指定（個人宅など）</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-red-900">
              ⚠️ 4. オフラインでの集合について（重要）
            </h2>
            <div className="space-y-3 text-red-900">
              <p className="font-semibold">
                本サービスはオンライン上のマッチング機能のみを提供します。
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>実際の集合・散策は利用者間の自己責任で行ってください。</li>
                <li>運営はオフラインでのトラブルについて一切の責任を負いません。</li>
                <li>初対面の方と会う際は、必ず公共の場で、昼間の時間帯を選んでください。</li>
                <li>貴重品の管理、安全確保は各自で行ってください。</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. プライバシー保護</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>本サービスでは性別情報を収集・表示しません。</li>
              <li>投稿された座標情報は±500m程度ぼかして表示されます。</li>
              <li>個人を特定できる情報は投稿しないでください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 通報・違反対応</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>不適切な投稿・ユーザーを発見した場合は通報してください。</li>
              <li>違反行為が確認された場合、警告なくアカウント停止を行う場合があります。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. データ保持</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>メッセージ・投稿内容は不正利用防止のため一定期間保存されます。</li>
              <li>通報があった場合、該当データを証拠として保全します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 免責事項</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>サービスの中断・終了について事前通知なく行う場合があります。</li>
              <li>利用者間トラブルについて運営は関与しません。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. 規約の変更</h2>
            <p className="text-gray-700">
              本規約は予告なく変更される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. 準拠法・管轄裁判所</h2>
            <p className="text-gray-700">
              本規約は日本法に準拠し、紛争が生じた場合は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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