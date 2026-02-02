// src/components/posts/JoinPostButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function JoinPostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleJoin = async () => {
    if (!confirm('この投稿に参加しますか？')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hasAgreed: true }), // ← これを追加
      });
      
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = '参加に失敗しました';
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          console.error('Error response:', text);
        }
        
        throw new Error(errorMessage);
      }
      
      const text = await response.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          console.log('参加成功:', data);
        } catch (e) {
          console.error('Invalid JSON response:', text);
        }
      }
      
      // 成功したらページをリロードしてチャットを表示
      router.refresh();
    } catch (error) {
      console.error('参加エラー:', error);
      alert(error instanceof Error ? error.message : '参加に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      {loading ? '参加中...' : 'この投稿に参加する'}
    </button>
  );
}