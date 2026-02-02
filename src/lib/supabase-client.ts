import { createBrowserClient as createClient } from '@supabase/ssr';

// ブラウザ用クライアント
export const createBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
