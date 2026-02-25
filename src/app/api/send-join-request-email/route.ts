// src/app/api/send-join-request-email/route.ts
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { authorEmail, authorName, applicantName, postTitle, message, postId } = await req.json()

  const { error } = await resend.emails.send({
    from: 'noreply@あなたのドメイン.com',  // ← 自分のドメイン
    to: authorEmail,
    subject: `【参加申請】${applicantName}さんが「${postTitle}」への参加を申請しました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #059669;">新しい参加申請が届きました</h2>
        
        <p>${authorName} さん、こんにちは。</p>
        <p><strong>${applicantName}</strong> さんが「<strong>${postTitle}</strong>」への参加を申請しました。</p>

        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #065f46;">参加理由・メッセージ</p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/posts/${postId}/manage-requests"
           style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          申請を確認・承認する
        </a>

        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
          このメールはシステムから自動送信されています。
        </p>
      </div>
    `
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}