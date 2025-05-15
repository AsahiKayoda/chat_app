// app/chat/page.tsx
'use client'

import { useState } from 'react';
import styles from './chat.module.css';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageForm from './MessageForm';

// ユーザー型定義
export type User = {
  id: number;
  name: string;
};

// メッセージ型定義
export type Message = {
  id: number;
  text: string;
};

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (text: string) => {
    if (!selectedUser) return;
    const newMessage: Message = {
      id: messages.length + 1,
      text,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className={styles.wrapper}>
      <UserList selectedUser={selectedUser} onSelectUser={setSelectedUser} />

      <div className={styles.chatArea}>
        <h3>{selectedUser ? `${selectedUser.name}` : 'ユーザーを選択してください'}</h3>
        <MessageList selectedUser={selectedUser} messages={messages} />
        <MessageForm onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
