// メールアドレスのバリデーション
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// パスワードのバリデーション
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// ユーザー名のバリデーション（オプション）
export function validateUsername(username: string): boolean {
  return username.trim().length >= 2 && username.trim().length <= 50;
}