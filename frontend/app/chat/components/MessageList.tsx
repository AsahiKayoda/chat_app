// app/chat/MessageList.tsx
'use client'

import { markMessageAsRead } from "../services/chatService";
import { useEffect, useRef } from "react";
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

const alreadyRead = useRef(new Set<number>());

useEffect(() => {
  messages.forEach((msg) => {
    const isMine = msg.sender_id === currentUserId;
    if (!isMine && !alreadyRead.current.has(msg.id)) {
      markMessageAsRead(msg.id);
      alreadyRead.current.add(msg.id); // 再送防止
    }
  });
}, [messages, currentUserId]);

 return (
    <div className={styles.messages}>
      {/* ✅ メッセージ一覧を1つずつ表示 */}
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;
        const sender = users.find((u) => u.id === msg.sender_id);
        const senderName = sender ? sender.name : '不明なユーザー';

        //console.log("🔍 message", msg);
        //console.log("✅ isMine:", isMine, "is_read:", msg.is_read);

        return (
          <div
            key={msg.id}
            className={`${styles.message} ${isMine ? styles.sent : styles.received}`}
          >
            {!isMine && (
              <div className={styles.senderName}>{senderName}</div>
            )}
            <div>{msg.text}</div>

            {/* ✅ 自分のメッセージで、is_read が true のときだけ既読表示 */}
            {isMine && typeof msg.is_read === "boolean" && msg.is_read && (
              <div className={styles.readStatus}>既読</div>
            )}

          </div>
        );
      })}
    </div>
  );
}
