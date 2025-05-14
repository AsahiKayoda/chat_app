// app/signup/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css'; // CSSモジュールを読み込む

export default function SignupPage() {
  // ユーザー名とパスワードの状態（入力値を保持）
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ページ遷移用のルーター（ログイン画面へ移動するため）
  const router = useRouter();

  // フォームが送信されたときの処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ページがリロードされるのを防ぐ

    console.log({ username, password }); // 入力内容を確認（API接続は後ほど）

    // 成功したと仮定してログイン画面へ移動
    router.push('/login');
  };

  return (
    // 🔲 全体ラッパー（中央寄せ用）
    <div className={styles.wrapper}>
      {/* 📦 中央に表示される白いフォームボックス */}
      <div className={styles.container}>
        <h1 className={styles.title}>サインアップ</h1>
        <form onSubmit={handleSubmit}>
          {/* 👤 ユーザー名入力欄 */}
          <input
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          {/* 🔐 パスワード入力欄 */}
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {/* 🔘 登録ボタン */}
          <button type="submit" className={styles.button}>登録</button>
        </form>
      </div>
    </div>
  );
}
