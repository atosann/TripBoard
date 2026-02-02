// src/components/posts/OpenChatButton.tsx
'use client';

export default function OpenChatButton({ 
  postId, 
  participantCount 
}: { 
  postId: string;
  participantCount?: number;
}) {
  const scrollToChat = () => {
    const chatSection = document.getElementById('group-chat');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <button
      onClick={scrollToChat}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
      グループチャットを開く
      {participantCount && participantCount > 0 && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
          {participantCount}人参加中
        </span>
      )}
    </button>
  );
}