// app/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import styles from './home.module.css';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      {/* 🎉 ウェルカムメッセージ */}
      <h1 className={styles.title}>Welcome to Chat!</h1>

      {/* 🔘 ログイン・サインアップボタン */}
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => router.push('/signup')}>
          サインアップ
        </button>
        <button className={styles.button} onClick={() => router.push('/login')}>
          ログイン
        </button>
      </div>
    </div>
  );
}
