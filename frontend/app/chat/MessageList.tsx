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
      {messages.map((msg) => {
        // ✅ 自分のメッセージかどうかを判定（相手と違えば自分とみなす）
        const isMine = msg.sender_id !== selectedUser.id;

        return (
          <div
            key={msg.id}
            // ✅ スタイルを sender に応じて左右切り替え
            className={`${styles.message} ${isMine ? styles.sent : styles.received}`}
          >
            {msg.text}
          </div>
        );
      })}
    </div>
  );
}
