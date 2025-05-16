// app/chat/components/ChatLayout.tsx
'use client';

import { useChatRoom } from '../hooks/useChatRoom';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import styles from '../chat.module.css';

export default function ChatLayout() {
  const {
    users,
    selectedUser,
    roomId,
    messages,
    error,
    handleSelectUser,
    handleSendMessage,
  } = useChatRoom();

  return (
    <div className={styles.wrapper}>
      <UserList users={users} selectedUser={selectedUser} onSelectUser={handleSelectUser} />

      <div className={styles.chatArea}>
        <h3>{selectedUser ? selectedUser.name : 'ユーザーを選択してください'}</h3>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <MessageList messages={messages} selectedUser={selectedUser} />

        {roomId && <MessageForm onSubmit={handleSendMessage} />}
      </div>
    </div>
  );
}
