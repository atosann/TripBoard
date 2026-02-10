import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSSのクラス名を結合するユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 相対的な時間表示を生成（例: "3分前", "2時間前"）
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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

/**
 * スパムや不適切な内容をチェック
 */
export function isSpam(text: string): boolean {
  const spamPatterns = [
    /https?:\/\//i, // URL
    /(\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{4})/g, // 電話番号
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // メールアドレス
    /(LINE|line|ライン).{0,10}(ID|アイ[デディ]ー|id)/gi, // LINE ID
    /(Twitter|twitter|X|ツイッター|インスタ|Instagram).{0,10}(ID|アイ[デディ]ー|フォロー)/gi, // SNS
    /(振込|振り込み|送金|お金|現金|報酬|バイト|高収入|稼げる|副業)/gi, // 金銭関連
    /(会いたい|会おう|会える|デート|泊まり|ホテル)/gi, // 出会い系
  ];

  return spamPatterns.some(pattern => pattern.test(text));
}