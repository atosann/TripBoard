// src/app/about/page.tsx
import Link from 'next/link'

export default function AboutPage() {
  const faqs = [
    {
      q: '無料で使えますか？',
      a: 'はい、完全無料でご利用いただけます。登録から投稿・チャットまですべての機能が無料です。',
    },
    {
      q: '年齢制限はありますか？',
      a: '18歳以上の方のみご利用いただけます。安全なコミュニティを維持するためにご理解をお願いします。',
    },
    {
      q: '実名を公開する必要がありますか？',
      a: 'いいえ、表示名（ニックネーム）のみで利用できます。本名・住所・電話番号などの個人情報は公開しないでください。',
    },
    {
      q: '参加申請したら必ず参加できますか？',
      a: '主催者が申請を承認した場合のみ参加できます。主催者の判断で申請が承認されないこともあります。',
    },
    {
      q: '不適切なユーザーや投稿を見かけたらどうすればいいですか？',
      a: '通報機能をご利用ください。運営が確認し、違反が認められた場合はアカウントを停止します。',
    },
    {
      q: 'トラブルが発生した場合、運営は対応してくれますか？',
      a: '本サービスはオンライン上のマッチング機能のみを提供しています。オフラインでのトラブルへの仲裁・介入は行っておりません。緊急の場合は警察等の公的機関にご相談ください。',
    },
    {
      q: 'アカウントを削除したい場合はどうすればいいですか？',
      a: 'アカウント設定ページからいつでも削除できます。削除すると投稿・メッセージ等のデータも削除されます。',
    },
  ]

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
            <h1 className="text-2xl font-bold text-gray-900">サービスについて</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

        {/* ヒーロー */}
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-10 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-3xl font-bold mb-3">みんなのメンバー募集掲示板</h2>
            <p className="text-emerald-50 text-lg leading-relaxed max-w-xl mx-auto">
              「一緒に行く人がいない」をなくす。<br />
              同じ気持ちの仲間と、もっと気軽につながれる場所。
            </p>
          </div>
        </div>

        {/* 理念・背景 */}
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-xl font-bold">🌱 サービスの背景と理念</h2>
          </div>
          <div className="bg-white px-6 py-8 space-y-4 text-gray-700 leading-relaxed">
            <p>
              「行きたい場所がある、やりたいことがある。でも一緒に行く友人がいない」——そんな経験は誰にでもあるのではないでしょうか。
            </p>
            <p>
              社会人になると、学生の頃のように気軽に誘える友人と予定を合わせることが難しくなります。同じ趣味を持つ人と出会う機会も限られています。
            </p>
            <p>
              みんなのメンバー募集掲示板は、そういった「やりたいこと」を持つ人同士が気軽につながれる場所として作られました。難しい手続きは不要です。やりたいことを投稿して、同じ気持ちの仲間を見つける。それだけです。
            </p>
            <p>
              近場の散策から旅行、カラオケ、スポーツまで——あなたの「一緒にやりたい！」を実現する場所でありたいと思っています。
            </p>
          </div>
        </div>

        {/* 大切にしていること */}
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-xl font-bold">💚 大切にしていること</h2>
          </div>
          <div className="bg-white px-6 py-8">
            <div className="grid gap-4">
              {[
                { icon: '🤝', title: '気軽さ', desc: '難しい登録や審査は不要。誰でもすぐに使い始められるシンプルさを大切にしています。' },
                { icon: '🛡️', title: '安全性', desc: '商業目的・出会い目的の利用を禁止し、公共の場での集合を推奨するなど、安全なコミュニティ作りに取り組んでいます。' },
                { icon: '🔒', title: 'プライバシー', desc: '個人情報の収集は最小限にとどめ、必要以上の情報公開を求めません。ニックネームだけで使えます。' },
                { icon: '🌍', title: '多様性', desc: 'カラオケから登山、飲み会から海外旅行まで、あらゆる「やりたいこと」を受け入れます。' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <h2 className="text-xl font-bold">❓ よくある質問（FAQ）</h2>
          </div>
          <div className="bg-white px-6 py-8 divide-y divide-gray-100">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5 first:pt-0 last:pb-0">
                <p className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-emerald-600 flex-shrink-0 font-extrabold">Q.</span>
                  {faq.q}
                </p>
                <p className="text-gray-600 leading-relaxed flex items-start gap-2 pl-5">
                  <span className="text-teal-600 flex-shrink-0 font-extrabold">A.</span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center text-white">
            <p className="text-xl font-bold mb-2">さっそく始めてみましょう！</p>
            <p className="text-emerald-50 text-sm mb-6">登録は無料・1分で完了します</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register">
                <button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-lg transition-all">
                  無料で登録する
                </button>
              </Link>
              <Link href="/main/all-posts">
                <button className="bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-3 rounded-full font-bold transition-all">
                  投稿を見る
                </button>
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}