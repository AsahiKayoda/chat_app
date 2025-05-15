
/*
1. ユーザーが選ばれた状態でフォームを表示
2. 入力欄にメッセージを書く
3. 「送信」ボタンを押す
4. `POST /chat-rooms` で対象ユーザーとのルームIDを取得（作成されてなければ作成）
5. `POST /messages` に `room_id` と `text` を送信
6. 成功したらメッセージ一覧を更新
*/
// app/chat/MessageForm.tsx
'use client'

import { useState } from 'react';
import styles from './chat.module.css';
import api from '@/lib/api';
import { User } from './page';

type Props = {
  selectedUser: User | null;
  onSendMessageSuccess?: () => void; // ✅ 送信成功後にリスト再取得などができるように
};

export default function MessageForm({ selectedUser, onSendMessageSuccess }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) return;
    if (!selectedUser) {
      setError('送信相手が選択されていません');
      return;
    }

    try {
      // ✅ ① チャットルーム作成 or 取得（room_id）
      const roomRes = await api.post('/chat-rooms', {
        target_user_id: selectedUser.id,
      });
      const roomId = roomRes.data.id;

      // ✅ ② メッセージ送信
      await api.post('/messages', {
        room_id: roomId,
        text: text.trim(),
      });

      setText(''); // 入力をクリア

      // ✅ ③ 親に通知（必要なら再取得）
      onSendMessageSuccess?.();
    } catch (err: any) {
      console.error('メッセージ送信失敗:', err);
      const status = err.response?.status;
      if (status === 401) {
        setError('認証エラー：ログインし直してください');
      } else {
        setError('メッセージの送信に失敗しました');
      }
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
