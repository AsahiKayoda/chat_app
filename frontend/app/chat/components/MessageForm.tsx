// app/chat/MessageForm.tsx
'use client'

import { useState } from 'react';
import styles from '../chat.module.css';


type Props = {
  onSubmit: (text: string) => void;
};

// ✅ メッセージ入力・送信フォームのコンポーネント
export default function MessageForm({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) return;

    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err: any) {
      setError('送信に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputArea}>
      <input
        type="text"
        placeholder="メッセージを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.messageInput}
      />
      <button type="submit" className={styles.sendButton}>送信</button>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </form>
  );
}
