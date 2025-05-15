// app/chat/page.tsx
'use client'

import { useEffect, useState } from 'react';
import styles from './chat.module.css';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import api from '@/lib/api';

export type User = {
  id: number;
  name: string;
};

export type Message = {
  id: number;
  text: string;
  sender_id: number;
  room_id: number;
  timestamp: string;
};

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');

  // ✅ ルームIDが変わったらメッセージを再取得
  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
    }
  }, [roomId]);

  // ✅ ユーザー選択時にルームを確定させる
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setMessages([]); // メッセージリストをリセット
    try {
      const res = await api.post('/chat-rooms', {
        target_user_id: user.id,
      });
      setRoomId(res.data.id);
    } catch (err: any) {
      console.error('ルーム作成失敗:', err);
      setError('ルームの取得に失敗しました');
    }
  };

  // ✅ メッセージ取得
  const fetchMessages = async (roomId: number) => {
    try {
      const res = await api.get(`/messages?room_id=${roomId}`);
      setMessages(res.data);
    } catch (err: any) {
      console.error('メッセージ取得失敗:', err);
      setError('メッセージの取得に失敗しました');
    }
  };

  return (
    <div className={styles.wrapper}>
      <UserList selectedUser={selectedUser} onSelectUser={handleSelectUser} />

      <div className={styles.chatArea}>
        <h3>{selectedUser ? `${selectedUser.name}` : 'ユーザーを選択してください'}</h3>

        {/* エラーメッセージ */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* メッセージ表示 */}
        <MessageList messages={messages} selectedUser={selectedUser} />

        {/* メッセージ送信 */}
        {roomId && (
          <MessageForm
            selectedUser={selectedUser}
            onSendMessageSuccess={() => fetchMessages(roomId)}
          />
        )}
      </div>
    </div>
  );
}

