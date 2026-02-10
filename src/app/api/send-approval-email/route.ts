// src/app/api/send-approval-email/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, postTitle, status, postId } = await request.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const isApproved = status === 'approved'
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: ${isApproved ? '#10b981' : '#667eea'}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isApproved ? '✅ 参加が承認されました！' : '❌ 申請について'}</h1>
            </div>
            <div class="content">
              <div class="card">
                ${isApproved ? `
                  <h2>おめでとうございます！</h2>
                  <p>「<strong>${postTitle}</strong>」への参加が承認されました。</p>
                  <p>グループチャットに参加して、他のメンバーとコミュニケーションを取りましょう！</p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${appUrl}/main/chats/${postId}" class="button">
                      グループチャットを開く
                    </a>
                    <a href="${appUrl}/main/posts/${postId}" class="button" style="background: #667eea;">
                      投稿を見る
                    </a>
                  </div>
                ` : `
                  <h2>申請結果について</h2>
                  <p>「<strong>${postTitle}</strong>」への参加申請は、残念ながら承認されませんでした。</p>
                  <p>他にも素敵な投稿がたくさんあります。ぜひ探してみてください！</p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${appUrl}/main/all-posts" class="button">
                      他の投稿を見る
                    </a>
                  </div>
                `}
              </div>

              <div class="footer">
                <p>このメールは TripBoard から自動送信されています。</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'TripBoard <noreply@tripboard.com>',
      to: [to],
      subject: isApproved 
        ? `【TripBoard】「${postTitle}」への参加が承認されました！` 
        : `【TripBoard】「${postTitle}」への申請について`,
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