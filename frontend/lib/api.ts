// lib/api.ts
//全てのリクエストの headers に Authorization: Bearer <token> を自動追加する
import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 毎回のリクエスト前にトークンを自動でヘッダーに追加する
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ レスポンスでエラーが返ってきた時の共通処理
api.interceptors.response.use(
  (response) => response, // 成功時はそのまま返す
  (error) => {
    if (error.response?.status === 401) {
      // ✅ トークンが無効 or 未ログイン → ログイン画面へリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
