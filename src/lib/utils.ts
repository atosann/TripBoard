import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 相対時間フォーマット（例: 3分前、1時間前）
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'たった今';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}年前`;
}

// スパムチェック
export function isSpam(text: string): boolean {
  const spamKeywords = [
    '副業', '稼げる', '投資', 'LINE', 'DM', '出会い',
    'マルチ', 'ネットワーク', '勧誘', 'ビジネス',
    '儲かる', '簡単に', '月収', '不労所得'
  ];

  const lowerText = text.toLowerCase();
  
  // スパムキーワードチェック
  const hasSpamKeyword = spamKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );

  // URL過多チェック（3個以上のURLはスパム）
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  const hasTooManyUrls = urlCount >= 3;

  return hasSpamKeyword || hasTooManyUrls;
}

// 座標をぼかす（±500m程度）
export function blurCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  // 約500m = 0.0045度（緯度経度）
  const offset = 0.0045;
  const randomLat = (Math.random() - 0.5) * offset;
  const randomLng = (Math.random() - 0.5) * offset;
  
  return {
    lat: lat + randomLat,
    lng: lng + randomLng,
  };
}

// 日付フォーマット（例: 2024年1月15日）
export function formatDate(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 日時フォーマット（例: 2024年1月15日 14:30）
export function formatDateTime(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}