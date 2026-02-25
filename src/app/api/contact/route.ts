// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { type, email, subject, body } = await request.json()

    if (!type || !email || !subject || !body) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    const typeLabels: Record<string, string> = {
      bug: '不具合・バグの報告',
      abuse: '迷惑ユーザー・違反投稿の報告',
      account: 'アカウントに関する問題',
      feature: '機能のご要望',
      other: 'その他',
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      replyTo: email,
      subject: `【お問い合わせ】${subject}`,
      text: `
種別: ${typeLabels[type] ?? type}
メールアドレス: ${email}
件名: ${subject}

内容:
${body}
      `.trim(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
  }
}