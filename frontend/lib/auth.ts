// lib/auth.ts

// ✅ トークンを保存
export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

// lib/auth.ts
export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}
