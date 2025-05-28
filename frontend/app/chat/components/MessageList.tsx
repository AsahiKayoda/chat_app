'use client';

import { useEffect, useRef } from 'react';
import { markMessageAsRead, deleteMessage } from '../services/chatService';
import styles from '../chat.module.css';
import { Message, User, ChatRoom } from '../types/chat';


type Props = {
  selectedUser: User | null;
  selectedGroup: ChatRoom | null;
  messages: Message[];
  currentUserId: number;
  users: User[];
  roomId: number;
  sendReadNotification: (roomId: number, messageIds: number[]) => void;
  setUnreadRoomIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  onDeleteMessage: (id: number) => void; // 🔧 追加
};

export default function MessageList({
  selectedUser,
  selectedGroup,
  messages,
  currentUserId,
  users,
  roomId,
  sendReadNotification,
  setUnreadRoomIds,
  onDeleteMessage, // 🔧 追加
}: Props) {
  if (!selectedUser && !selectedGroup) return null;

  const alreadyRead = useRef(new Set<number>());

  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) =>
        msg.room_id === roomId &&
        msg.sender_id !== currentUserId &&
        !alreadyRead.current.has(msg.id)
    );

    if (unreadMessages.length === 0) return;

    unreadMessages.forEach((msg) => {
      alreadyRead.current.add(msg.id);
      markMessageAsRead(msg.id);
    });

    const ids = unreadMessages.map((msg) => msg.id);
    sendReadNotification(roomId, ids);

    setUnreadRoomIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
  }, [messages, currentUserId, roomId, sendReadNotification, setUnreadRoomIds]);

  const handleDelete = async (id: number) => {
    const confirmed = confirm('このメッセージを削除しますか？');
    if (!confirmed) return;

    try {
      await deleteMessage(id);
      onDeleteMessage(id); // 🧹 状態反映
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className={styles.messages}>
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;
        const sender = users.find((u) => u.id === msg.sender_id);
        const senderName = sender ? sender.name : '不明なユーザー';

        return (
          <div
            key={msg.id}
            className={`${styles.message} ${isMine ? styles.sent : styles.received}`}
          >
            {!isMine && <div className={styles.senderName}>{senderName}</div>}
            <div>{msg.text}</div>

            {msg.attachments &&
              msg.attachments.map((att) => (
                <div key={att.id} className={styles.attachment}>
                  <img
                    src={att.url}
                    alt="添付画像"
                    className={styles.attachmentImage}
                  />
                </div>
              ))}

            {isMine && msg.is_read && (
              <div className={styles.readStatus}>既読</div>
            )}

            {/* 🔘 削除ボタン */}
            {isMine && (
              <div className={styles.actions}>
                <button onClick={() => handleDelete(msg.id)}className={styles.deleteButton}>削除</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
