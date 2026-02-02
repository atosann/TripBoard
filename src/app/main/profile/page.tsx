import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { ProfileEditForm } from './ProfileEditForm';
import { LogoutButton } from './LogoutButton';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

async function getUserPosts(userId: string) {
  const supabase = await createServerClient();
  
  const { data } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      event_date,
      status,
      participants(id)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  return data || [];
}

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUser();
  const posts = await getUserPosts(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/main/posts">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold ml-3">プロフィール</h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* プロフィール情報 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileEditForm profile={profile} userId={user.id} />
              </CardContent>
            </Card>

            {/* 投稿履歴 */}
            <Card>
              <CardHeader>
                <CardTitle>投稿履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    まだ投稿がありません
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {posts.map((post: any) => (
                      <li key={post.id} className="border-b pb-3 last:border-0">
                        <Link href={`/main/posts/${post.id}`}>
                          <div className="hover:bg-gray-50 p-2 rounded">
                            <h3 className="font-medium">{post.title}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>
                                参加者: {post.participants?.length || 0}人
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  post.status === 'open'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {post.status === 'open' ? '募集中' : '締切'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>アカウント情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">メールアドレス</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">信頼度スコア</p>
                  <p className="font-medium">{profile?.trust_score || 100}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">登録日</p>
                  <p className="font-medium">
                    {new Date(profile?.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
