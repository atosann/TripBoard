import Link from 'next/link'

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-2xl font-bold">みんなのメンバー募集掲示板 利用規約</h2>
            <p className="text-emerald-50 text-sm mt-1">最終更新: 2025年1月1日</p>
          </div>

          <div className="bg-white px-6 py-8 space-y-8">

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                サービス概要
              </h3>
              <p className="text-gray-700 leading-relaxed pl-9">
                みんなのメンバー募集掲示板（以下「本サービス」）は、近場散策・日帰り旅行・各種アクティビティの参加者募集を目的とした掲示板およびグループチャット機能を提供するウェブサービスです。本規約に同意した上でご利用ください。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                利用条件
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>18歳以上の方がご利用いただけます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>1人につき1アカウントまでとします。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>正確な情報を登録してください。虚偽の情報の登録を禁じます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>アカウントの共有・譲渡・売買は禁止します。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>ログイン情報の管理はご自身の責任で行ってください。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                禁止事項
              </h3>
              <p className="text-gray-700 pl-9 mb-3">以下の行為を禁止します。違反した場合は予告なくアカウントを停止します。</p>
              <ul className="pl-9 space-y-2 text-gray-700">
                {[
                  '商業目的の勧誘・マルチ商法・ネットワークビジネスへの勧誘',
                  '出会い・交際を目的とした利用、わいせつな内容の投稿',
                  '他人へのなりすまし、誹謗中傷、ハラスメント行為',
                  'スパム投稿・連続投稿・同一内容の重複投稿',
                  '個人情報（住所・電話番号・金融情報など）の無断公開',
                  '公共の場以外での集合指定（個人宅・人目のない場所など）',
                  '犯罪行為・違法行為への勧誘・助長',
                  'サービスへの不正アクセス・クラッキング行為',
                  'その他、運営が不適切と判断する行為',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 重要セクション */}
            <section className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                4. オフラインでの集合・活動について（重要）
              </h3>
              <p className="text-amber-900 font-semibold mb-3">
                本サービスはオンライン上のマッチング機能のみを提供します。実際の集合・活動はすべて利用者間の自己責任で行ってください。
              </p>
              <ul className="space-y-2 text-amber-900">
                {[
                  '運営はオフラインでのトラブル・事故・損害について一切の責任を負いません。',
                  '初対面の方と会う際は、必ず昼間・公共の場所を選んでください。',
                  '金銭のやり取りが発生する場合は十分に注意してください。',
                  '貴重品の管理・安全確保は各自で行ってください。',
                  '未成年者との接触には特に注意してください。',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>{item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                投稿・コンテンツについて
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>投稿内容の著作権は投稿者に帰属しますが、本サービスの運営・改善目的での利用を許諾するものとします。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>他者の著作権・肖像権を侵害するコンテンツの投稿を禁じます。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>投稿内容は運営が事前の通知なく削除できるものとします。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                プライバシー保護
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>個人を特定できる情報（住所・電話番号など）は投稿しないでください。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>詳細な待ち合わせ場所はチャット内でのみ共有してください。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>他の利用者の個人情報を無断で収集・公開する行為を禁じます。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                通報・違反対応
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>不適切な投稿・ユーザーを発見した場合は通報機能をご利用ください。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>違反行為が確認された場合、警告なくアカウント停止・投稿削除を行います。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>悪質な違反については、法的措置を取る場合があります。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                免責事項
              </h3>
              <ul className="pl-9 space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>本サービスは現状有姿で提供され、特定目的への適合性を保証しません。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>システム障害・メンテナンス等によるサービス中断について責任を負いません。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>利用者間のトラブルについて運営は関与・仲裁を行いません。</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>投稿内容の正確性・信頼性について運営は保証しません。</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">9</span>
                サービスの変更・終了
              </h3>
              <p className="text-gray-700 pl-9">
                運営は事前の通知なく、サービス内容の変更・機能の追加削除・サービスの一時停止または終了を行う場合があります。これにより生じた損害について運営は責任を負いません。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">10</span>
                規約の変更
              </h3>
              <p className="text-gray-700 pl-9">
                本規約は必要に応じて変更されます。重要な変更はサービス内でお知らせしますが、継続利用をもって変更に同意したものとみなします。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">11</span>
                準拠法・管轄裁判所
              </h3>
              <p className="text-gray-700 pl-9">
                本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}