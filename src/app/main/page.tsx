import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TopPage() {
  // 投稿例のデータ
  const examplePosts = [
    {
      id: 1,
      category: 'カラオケ',
      icon: '🎤',
      color: 'from-pink-500 to-rose-500',
      title: '渋谷でカラオケオフ会！',
      author: 'カラオケ太郎',
      participants: '3/5人',
      date: '2026年2月15日 19:00',
      location: '東京都',
      description: 'アニソン中心に歌いませんか？初心者歓迎です！'
    },
    {
      id: 2,
      category: '登山',
      icon: '⛰️',
      color: 'from-green-500 to-emerald-500',
      title: '高尾山ハイキング仲間募集',
      author: '山田健太',
      participants: '4/8人',
      date: '2026年2月20日 9:00',
      location: '東京都',
      description: '初心者向けのゆるい登山です。一緒に自然を楽しみましょう！'
    },
    {
      id: 3,
      category: '居酒屋',
      icon: '🍺',
      color: 'from-orange-500 to-amber-500',
      title: '新宿で飲み会メンバー募集',
      author: '飲み会幹事',
      participants: '6/10人',
      date: '2026年2月18日 18:30',
      location: '東京都',
      description: '20代~30代で楽しく飲みましょう！予算3000円程度です。'
    },
    {
      id: 4,
      category: 'フットサル',
      icon: '⚽',
      color: 'from-blue-500 to-cyan-500',
      title: '週末フットサルメンバー募集',
      author: 'サッカー好き',
      participants: '8/12人',
      date: '2026年2月22日 14:00',
      location: '神奈川県',
      description: '初心者も大歓迎！楽しくプレーしましょう！'
    },
    {
      id: 5,
      category: 'カフェ巡り',
      icon: '☕',
      color: 'from-purple-500 to-pink-500',
      title: '表参道カフェ巡りしませんか',
      author: 'カフェ好き',
      participants: '2/4人',
      date: '2026年2月16日 13:00',
      location: '東京都',
      description: 'おしゃれなカフェを巡りながらお話ししましょう！'
    },
    {
      id: 6,
      category: 'ボードゲーム',
      icon: '🎲',
      color: 'from-indigo-500 to-blue-500',
      title: 'ボードゲームカフェで遊ぼう',
      author: 'ゲーム王',
      participants: '5/6人',
      date: '2026年2月19日 15:00',
      location: '東京都',
      description: '人狼やカタンなど、いろんなゲームで盛り上がりましょう！'
    },
    {
      id: 7,
      category: '温泉旅行',
      icon: '♨️',
      color: 'from-red-500 to-pink-500',
      title: '箱根温泉一泊二日の旅',
      author: '温泉マニア',
      participants: '4/6人',
      date: '2026年3月5日 10:00',
      location: '神奈川県',
      description: '箱根の温泉旅館に泊まって、のんびり温泉三昧！美味しい料理も楽しみましょう。'
    },
    {
      id: 8,
      category: '日帰り旅行',
      icon: '🚅',
      color: 'from-teal-500 to-green-500',
      title: '京都日帰り観光ツアー',
      author: '旅行好き',
      participants: '5/8人',
      date: '2026年2月28日 7:00',
      location: '京都府',
      description: '清水寺、金閣寺、嵐山を巡る日帰りツアー！新幹線で気軽に京都を満喫しましょう。'
    },
    {
      id: 9,
      category: '海外旅行',
      icon: '✈️',
      color: 'from-sky-500 to-blue-500',
      title: '台北3泊4日グルメ旅行',
      author: 'グルメ旅人',
      participants: '3/5人',
      date: '2026年4月10日 8:00',
      location: '海外（台湾）',
      description: '小籠包、タピオカ、夜市グルメ！台北の美味しいものを食べ尽くす旅です。'
    }
  ]

  const categories = [
    { name: 'カラオケ', icon: '🎤', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { name: '登山・アウトドア', icon: '⛰️', color: 'bg-green-100 text-green-700 border-green-200' },
    { name: '居酒屋・飲み会', icon: '🍺', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { name: 'スポーツ', icon: '⚽', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'カフェ巡り', icon: '☕', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { name: 'ゲーム', icon: '🎲', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { name: '旅行', icon: '✈️', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { name: 'その他', icon: '🎉', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ヒーローセクション */}
      <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30">
              <span className="text-3xl">👥</span>
              <span className="text-xl font-bold">メンバー募集掲示板</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            一緒に楽しもう！
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-50 max-w-3xl mx-auto leading-relaxed">
            カラオケ、登山、飲み会、スポーツ...<br />
            あなたの「やりたい！」を仲間と一緒に実現しよう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all font-bold">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                無料で始める
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white/20 text-lg px-8 py-6 rounded-full font-bold">
                ログイン
              </Button>
            </Link>
          </div>
        </div>
        {/* 装飾的な波 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </header>

      {/* 特徴セクション */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            こんなことができます
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">イベント投稿</h3>
              <p className="text-gray-600 leading-relaxed">
                カラオケ、スポーツ、飲み会など、あなたのやりたいことを自由に投稿できます
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                💬
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">チャット機能</h3>
              <p className="text-gray-600 leading-relaxed">
                参加者とリアルタイムでチャット。詳細な待ち合わせ場所などもスムーズに調整
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🤝
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">仲間との出会い</h3>
              <p className="text-gray-600 leading-relaxed">
                同じ趣味を持つ仲間と出会い、一緒に楽しい時間を過ごせます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* カテゴリセクション */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            人気のカテゴリ
          </h2>
          <p className="text-center text-gray-600 mb-12">
            様々なジャンルのメンバー募集が集まっています
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`${category.color} border-2 rounded-xl p-6 text-center hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-bold text-sm">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 投稿例セクション */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            こんな募集があります
          </h2>
          <p className="text-center text-gray-600 mb-12">
            実際の投稿例をご覧ください
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examplePosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 group"
              >
                <div className={`bg-gradient-to-r ${post.color} p-4 text-white`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{post.icon}</span>
                    <span className="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:scale-105 transition-transform">
                    {post.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-emerald-600">{post.participants}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{post.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            今すぐ始めよう！
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            無料で登録して、あなたも仲間を見つけませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-2xl font-bold">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                新規登録（無料）
              </Button>
            </Link>
            <Link href="/main/all-posts">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white/20 text-lg px-10 py-6 rounded-full font-bold">
                投稿を見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <span>👥</span>
              <span>メンバー募集掲示板</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            一緒に楽しもう！カラオケ、登山、飲み会、スポーツなど、様々なメンバー募集が集まる場所
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              サービスについて
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              お問い合わせ
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
            © 2026 メンバー募集掲示板. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}