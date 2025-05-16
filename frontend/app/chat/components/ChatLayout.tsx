// app/chat/components/ChatLayout.tsx
'use client';

import { useChatRoom } from '../hooks/useChatRoom';

import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
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

  const router = useRouter();
  const handleLogout = () => {
    removeToken();         // ✅ トークンを消す
    router.push('/login'); // ✅ ログイン画面に遷移
  }; 

  return (
    <div className={styles.wrapper}>
      
      <UserList users={users} selectedUser={selectedUser} onSelectUser={handleSelectUser} />

      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <h3>{selectedUser ? selectedUser.name :''}</h3>
          <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>
        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <MessageList messages={messages} selectedUser={selectedUser} />
        
        {roomId && <MessageForm onSubmit={handleSendMessage} />}
      </div>
    </div>
  );
}
