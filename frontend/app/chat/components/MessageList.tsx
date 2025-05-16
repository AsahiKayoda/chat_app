// app/chat/MessageList.tsx
'use client'

import styles from '../chat.module.css';
import { Message, User } from '../types/chat';

// ✅ Props の型定義：親コンポーネントから selectedUser（選択中のユーザー）と messages（メッセージ一覧）を受け取る
type Props = {
  selectedUser: User | null; 
  messages: Message[];
};
// ✅ メッセージ一覧を表示するコンポーネント
export default function MessageList({ selectedUser, messages }: Props) {
// ✅ ユーザーが選ばれていない場合は何も表示しない（安全対策）
  if (!selectedUser) return null;

 return (
    <div className={styles.messages}>
      {/* ✅ メッセージ一覧を1つずつ表示 */}
      {messages.map((msg) => {
        // ✅ メッセージの sender_id が selectedUser（相手）の ID と異なる場合、自分のメッセージとみなす
        const isMine = msg.sender_id !== selectedUser.id;

        return (
          <div
            key={msg.id}
            // ✅ 自分のメッセージなら右寄せ（sent）、相手のメッセージなら左寄せ（received）のスタイルを適用
            className={`${styles.message} ${isMine ? styles.sent : styles.received}`}
          >
            {msg.text}{/* ✅ メッセージ本文を表示 */}
          </div>
        );
      })}
    </div>
  );
}
