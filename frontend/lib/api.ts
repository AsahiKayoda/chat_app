//axios の設定や API 共通関数
//axiosはfetchより簡単だけどメモリの使用量が多い
import axios from 'axios';



// ✅ Axios のインスタンスを作成（共通の設定をまとめる）
const api = axios.create({
  baseURL: 'http://localhost:8080', // ← Go の API サーバーのURL（Dockerで起動してるAPI）
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ トークンをセットする関数（ログイン後に使う）
export function setAuthToken(token: string) {
  // 全てのリクエストに Authorization ヘッダーを追加する
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ✅ トークンを消す関数（ログアウト時など）
export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// ✅ API本体（import して使う用）
export default api;
