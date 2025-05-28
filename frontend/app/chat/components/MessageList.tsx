'use client';

import { useEffect, useRef } from 'react';
import { markMessageAsRead } from '../services/chatService';
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
      markMessageAsRead(msg.id); // ✅ DBにも反映
    });

    const ids = unreadMessages.map((msg) => msg.id);
    sendReadNotification(roomId, ids);

    setUnreadRoomIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
  }, [messages, currentUserId, roomId, sendReadNotification, setUnreadRoomIds]);

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

            {/* ✅ 添付画像の表示 */}
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
          </div>
        );
      })}
    </div>
  );}
