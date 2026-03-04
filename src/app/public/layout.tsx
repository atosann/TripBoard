import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'みんなのメンバー募集掲示板 | 旅の仲間を探そう',
  description: '一緒に旅行や散策する仲間を募集・検索できる掲示板です。行きたい場所や日程で仲間を見つけましょう。',
  keywords: 'メンバー募集, 旅行, 散策, 仲間, 掲示板',
  openGraph: {
    title: 'みんなのメンバー募集掲示板',
    description: '一緒に旅行や散策する仲間を募集・検索できる掲示板です。',
    url: 'https://minnanomemberboard.com/public',
    siteName: 'みんなのメンバー募集掲示板',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}