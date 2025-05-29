'use client';

import { useEffect, useRef, useState } from 'react';
import { markMessageAsRead, deleteMessage } from '../services/chatService';
import { getHiddenMessageIds, addHiddenMessageId } from '@/lib/hiddenMessages';
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
  onDeleteMessage: (id: number) => void;
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
  onDeleteMessage,
}: Props) {
  if (!selectedUser && !selectedGroup) return null;

  const alreadyRead = useRef(new Set<number>());
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const loadHidden = () => {
      try {
        const hidden = getHiddenMessageIds(currentUserId);
        setHiddenIds(hidden);
      } catch (e) {
        console.error('Failed to load hidden messages:', e);
      } finally {
        setIsReady(true);
      }
    };
    loadHidden();
  }, [currentUserId]);

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

  const handleHide = (id: number) => {
    try {
      addHiddenMessageId(currentUserId, id);
      setHiddenIds(prev => [...prev, id]);
      onDeleteMessage(id);
    } catch (err) {
      console.error(err);
      alert('非表示に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm('このメッセージを削除しますか？');
    if (!confirmed) return;
    try {
      await deleteMessage(id); // ← fetch の代わりにこれを呼ぶ！
      onDeleteMessage(id);
    } catch (err) {
      console.error('削除に失敗しました:', err);
      alert('削除に失敗しました');
    }
  };

  if (!isReady) return null;

  const visibleMessages = messages.filter(msg => !hiddenIds.includes(msg.id));

  return (
    <div className={styles.messages}>
      {visibleMessages.map((msg) => {
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
                <button onClick={() => handleHide(msg.id)}className={styles.deleteButton}>非表示</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
