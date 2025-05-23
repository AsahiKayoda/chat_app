'use client';

import { useChatRoom } from '../hooks/useChatRoom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useChatSocket } from '../hooks/useChatSocket';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

import UserList from './UserList';
import GroupList from './GroupList';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import CreateGroupModal from './CreateGroupModal';
import styles from '../chat.module.css';

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
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const shouldConnectSocket = roomId !== null && currentUserId !== null;
  const { messages, sendMessage } = useChatSocket(
    shouldConnectSocket ? roomId : -1,
    shouldConnectSocket ? currentUserId : -1
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
        />
        <GroupList
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setShowCreateModal(true)}
        />
      </div>

      <div className={styles.chatArea}>
        {roomId === null ? (
          <div>ルームまたはユーザーが未選択です</div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <h3>{selectedUser?.name || selectedGroup?.roomName || ''}</h3>
              <button onClick={handleLogout} className={styles.logoutButton}>
                ログアウト
              </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <MessageList
              messages={messages}
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              currentUserId={currentUserId ?? -1}
              users={users}
            />

            <MessageForm onSubmit={sendMessage} />
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
