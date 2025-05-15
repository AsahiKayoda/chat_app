// lib/auth.ts

// ✅ トークンを保存
export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

// ✅ トークンを取得
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// ✅ トークンを削除（ログアウト時など）
export function removeToken() {
  localStorage.removeItem('token');
}
