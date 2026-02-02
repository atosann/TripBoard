// src/components/posts/PostCard.tsx
'use client';

import Link from 'next/link';

export default function PostCard({ 
  post, 
  currentUserId 
}: { 
  post: any;
  currentUserId: string;
}) {
  const isAuthor = post.author_id === currentUserId;
  
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          📅 {new Date(post.event_date).toLocaleDateString('ja-JP')}
        </span>
        
        <Link 
          href={`/main/posts/${post.id}`}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isAuthor 
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {isAuthor ? '💬 チャットを見る' : '詳細を見る'}
        </Link>
      </div>
      
      {isAuthor && (
        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          あなたの投稿
        </div>
      )}
    </div>
  );
}