'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import api from '@/lib/api'; // ✅ APIをインポート

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // ✅ フォーム送信時にAPIを叩く
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // エラーリセット

    try {
      // ✅ POST /signup APIを呼び出す（バックエンドに新規ユーザー登録）
      await api.post('/signup', {
        name: username,
        email: email,
        password: password,
      });

      // 成功したらログイン画面へ遷移
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      // サーバーから返ってきたエラー内容（例: SQLSTATE 23505など）
      const rawMessage = err?.response?.data?.error_message ?? '';

      if (rawMessage.includes('23505') || rawMessage.includes('unique constraint')) {
        setError('このメールアドレスはすでに使われています。');
      } else {
        setError('サインアップに失敗しました。しばらくしてからもう一度お試しください。');
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>サインアップ</h1>

        {/* エラー表示（あれば） */}
        {error && <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
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
          <button type="submit" className={styles.button}>登録</button>
        </form>
      </div>
    </div>
  );
}
