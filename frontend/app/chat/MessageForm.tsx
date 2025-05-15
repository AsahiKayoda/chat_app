// app/chat/MessageForm.tsx
'use client'

import { useState } from 'react';
import styles from './chat.module.css';

type Props = {
  onSendMessage: (text: string) => void;
};

export default function MessageForm({ onSendMessage }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
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
    </form>
  );
}
