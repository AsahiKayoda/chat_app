// app/chat/MessageList.tsx
'use client'

import styles from './chat.module.css';
import { Message, User } from './page';

type Props = {
  selectedUser: User | null;
  messages: Message[];
};

export default function MessageList({ selectedUser, messages }: Props) {
  if (!selectedUser) return null;

  return (
    <div className={styles.messages}>
      {messages.map((msg) => (
        <div key={msg.id} className={styles.message}>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
