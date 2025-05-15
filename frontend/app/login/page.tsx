'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import api from '@/lib/api'; // ← APIクライアントを使う
import { saveToken } from '@/lib/auth'; // ← JWT保存用関数

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ APIにログイン情報を送信
      const res = await api.post('/login', {
        email: email,
        password: password,
      });

      console.log('レスポンス:', res.data); // ← ここで中身を確認！

      // ✅ トークンがレスポンスに含まれているかチェック
      const token = res.data?.token;
      if (!token) {
        setError('トークンが取得できませんでした');
        return;
      }

      // ✅ JWTトークンを保存
      saveToken(token);

      // ✅ 成功したらチャット画面へ
      router.push('/chat');
    } catch (err: any) {
      console.error(err);
      setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>ログイン</h1>

        {/* エラー表示 */}
        {error && <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>ログイン</button>
        </form>
      </div>
    </div>
  );
}
