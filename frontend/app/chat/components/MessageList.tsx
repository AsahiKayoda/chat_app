// app/chat/MessageList.tsx
'use client'

import styles from '../chat.module.css';
import { Message, User, ChatRoom } from '../types/chat';

// ✅ Props の型定義：親コンポーネントから selectedUser（選択中のユーザー）と messages（メッセージ一覧）を受け取る
type Props = {
  selectedUser: User | null;
  selectedGroup: ChatRoom | null; 
  messages: Message[];
  currentUserId: number;
};
// ✅ メッセージ一覧を表示するコンポーネント
export default function MessageList({ selectedUser, selectedGroup, messages, currentUserId }: Props) {
// ✅ ユーザーが選ばれていない場合は何も表示しない（安全対策）
  if (!selectedUser && !selectedGroup) return null;

 return (
    <div className={styles.messages}>
      {/* ✅ メッセージ一覧を1つずつ表示 */}
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;

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
