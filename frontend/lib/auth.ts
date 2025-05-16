// lib/auth.ts

// ✅ トークンを保存
export function saveToken(token: string) {
  sessionStorage.setItem('token', token);
}

// lib/auth.ts
export function getToken(): string | null {
  return typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('token');
  }
}
