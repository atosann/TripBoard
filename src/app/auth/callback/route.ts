// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) throw exchangeError;
      
      if (session?.user) {
        // usersテーブルにレコードがあるか確認
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // usersテーブルにレコードがない場合（LINEログインの初回など）
        if (userError && userError.code === 'PGRST116') {
          // LINEログインユーザーの場合
          const isLineUser = session.user.app_metadata.provider === 'line';
          
          const displayName = isLineUser 
            ? (session.user.user_metadata.full_name || session.user.user_metadata.name || 'LINEユーザー')
            : (session.user.user_metadata.display_name || 'ユーザー');

          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              display_name: displayName,
            });

          if (insertError) {
            console.error('User creation error:', insertError);
            return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=user_creation_failed`)
          }
        }
      }
      
      // 認証成功
      // LINEログインの場合は直接メイン画面へ、メール認証の場合は確認ページへ
      const isOAuthLogin = session?.user?.app_metadata.provider !== 'email';
      const redirectPath = isOAuthLogin ? '/main/posts' : '/auth/verified';
      
      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
    } catch (error) {
      console.error('Auth callback error:', error);
      // 認証失敗
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=verification_failed`)
    }
  }

  // コードがない場合
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}