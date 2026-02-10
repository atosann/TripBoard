// src/app/api/send-notification-email/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, postTitle, requesterName, message, postId, requestId } = await request.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .message { background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 新しい参加申請が届きました</h1>
            </div>
            <div class="content">
              <div class="card">
                <h2>あなたの投稿に参加希望者が現れました！</h2>
                <p><strong>投稿タイトル:</strong> ${postTitle}</p>
                <p><strong>申請者:</strong> ${requesterName}</p>
                
                ${message ? `
                  <div class="message">
                    <strong>メッセージ:</strong><br>
                    ${message}
                  </div>
                ` : ''}

                <p style="margin-top: 20px;">下のボタンから申請を確認して、承認または拒否してください。</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${appUrl}/main/posts/${postId}/requests" class="button">
                    申請を確認する
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>このメールは TripBoard から自動送信されています。</p>
                <p>心当たりがない場合は、このメールを無視してください。</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'TripBoard <noreply@tripboard.com>',
      to: [to],
      subject: `【TripBoard】「${postTitle}」に新しい参加申請が届きました`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('メール送信エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}