'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const confirmed = confirm('ログアウトしますか？');
    if (!confirmed) return;

    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="w-4 h-4 mr-2" />
      ログアウト
    </Button>
  );
}
