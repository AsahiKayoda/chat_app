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
  users: User[];
};
// ✅ メッセージ一覧を表示するコンポーネント
export default function MessageList({ selectedUser, selectedGroup, messages, currentUserId,users }: Props) {
// ✅ ユーザーが選ばれていない場合は何も表示しない（安全対策）
  if (!selectedUser && !selectedGroup) return null;

 return (
    <div className={styles.messages}>
      {/* ✅ メッセージ一覧を1つずつ表示 */}
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;
        const sender = users.find((u) => u.id === msg.sender_id);
        const senderName = sender ? sender.name : '不明なユーザー';

        return (
          <div
            key={msg.id}
            // ✅ 自分のメッセージなら右寄せ（sent）、相手のメッセージなら左寄せ（received）のスタイルを適用
            className={`${styles.message} ${isMine ? styles.sent : styles.received}`}            
          > {/* 相手の名前（自分以外の場合のみ） */}
            {!isMine && (
              <div className={styles.senderName}>{senderName}</div>
            )}
            <div>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}
