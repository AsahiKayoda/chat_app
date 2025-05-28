// ✅ ChatLayout.tsx（fetchMessages を移し、useChatSocket はリアルタイム専用に）
'use client';

import { useChatRoom } from '../hooks/useChatRoom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useChatSocket } from '../hooks/useChatSocket';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
import { fetchMessages, fetchUnreadMessages, getMentions } from '../services/chatService';

import UserList from './UserList';
import GroupList from './GroupList';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import MentionButton from './MentionBotton'
import MentionModal from './MentionModel'
import CreateGroupModal from './CreateGroupModal';

import styles from '../chat.module.css'
import { Message } from '../types/chat';
import { Mention } from '../types/chat';

export default function ChatLayout() {
  const {
    users,
    groups,
    selectedUser,
    selectedGroup,
    roomId,
    error,
    handleSelectUser,
    handleSelectGroup,
    createGroup
  } = useChatRoom();

  const { currentUserId, loading: userLoading, error: userError } = useCurrentUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMentionModal, setShowMentionModal] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [unreadRoomIds, setUnreadRoomIds] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const handleDeleteMessage = (id: number) => {
  setMessages(prev => prev.filter(msg => msg.id !== id));
};
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  // ✅ ログイン後、一度だけ未読情報取得
  useEffect(() => {
    if (!currentUserId) return;
    getMentions()
    .then((data) => setMentions(data))
    .catch((err) => console.error('🔴 mentions取得失敗', err));
    fetchUnreadMessages()
      .then((msgs) => {
        const roomIds = new Set(msgs.map((m) => m.room_id));
        setUnreadRoomIds(roomIds);
      })
      .catch((err) => console.error('未読取得失敗:', err));
  }, [currentUserId]);

  // ✅ ルーム切替時にメッセージ取得
  useEffect(() => {
    if (roomId === null || currentUserId === null) return;

    fetchMessages(roomId)
      .then((initialMessages) => {
        setMessages((prev) => {
          const others = prev.filter((msg) => msg.room_id !== roomId);
          return [...others, ...initialMessages];
        });
      })
      .catch((err) => console.error("❌ メッセージ取得失敗:", err));
  }, [roomId, currentUserId]);

  // ✅ WebSocket接続はリアルタイム専用に限定（setMessages を渡す）
  const {
    sendMessage,
    sendReadNotification
  } = useChatSocket(
    currentUserId ?? -1,
    setUnreadRoomIds,
    roomId ?? -1,
    setMessages
  );

  if (userLoading) return <div>ユーザー情報を読み込み中...</div>;
  if (userError || !currentUserId) return <div>ユーザー情報の取得に失敗しました</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarContainer}>
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          currentUserId={currentUserId ?? -1}
          unreadRoomIds={unreadRoomIds}
        />
        <GroupList
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setShowCreateModal(true)}
          unreadRoomIds={unreadRoomIds}
        />
      </div>

      <div className={styles.chatArea}>
        {roomId === null ? (
          <div>ルームまたはユーザーが未選択です</div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <h3>{selectedUser?.name || selectedGroup?.roomName || ''}</h3>
              {/* 🔔 メンションボタン */}
              <MentionButton count={mentions.length} onClick={() => setShowMentionModal(true)} />
              {showMentionModal && (
                <MentionModal mentions={mentions} onClose={() => setShowMentionModal(false)} />
              )}    
              <button onClick={handleLogout} className={styles.logoutButton}>
                ログアウト
              </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <MessageList
              messages={messages.filter((msg) => msg.room_id === roomId)}
              onDeleteMessage={handleDeleteMessage}
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              currentUserId={currentUserId ?? -1}
              users={users}
              roomId={roomId}
              sendReadNotification={sendReadNotification}
              setUnreadRoomIds={setUnreadRoomIds}
            />

           <MessageForm
              roomId={roomId}
              currentUserId={currentUserId}
              onMessageSent={() => fetchMessages(roomId)}
            />
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          users={users}
          currentUserId={currentUserId ?? -1}
          onCreate={(name, members) => {
            createGroup(name, members);
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
