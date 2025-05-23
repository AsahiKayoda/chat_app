'use client'

import styles from '../chat.module.css'; 
import { User } from '../types/chat';

// ✅ ExtendedUser 型に更新
type ExtendedUser = User & { roomId?: number };

// ✅ props の型も ExtendedUser を使うよう修正
type Props = {
  users: ExtendedUser[];
  selectedUser: ExtendedUser | null;
  onSelectUser: (user: ExtendedUser) => void;
  currentUserId: number;
  unreadRoomIds?: Set<number>;
};

// ✅ ユーザー一覧を表示する UI コンポーネント
export default function UserList({
  users,
  selectedUser,
  onSelectUser,
  currentUserId,
  unreadRoomIds = new Set(),
}: Props) {
  return (
    <div className={styles.sidebar}>
      <h3>ユーザー一覧</h3>
      {users
        .filter((user) => user.id !== currentUserId)
        .map((user) => {
          
        const hasUnread = !!user.roomId && unreadRoomIds.has(user.roomId);

          return (
            <div
              key={user.id}
              className={styles.user}
              onClick={() => onSelectUser(user)}
              style={{
                backgroundColor:
                  selectedUser?.id === user.id ? '#cce5ff' : undefined,
              }}
            >
              {user.name}
              {hasUnread && <span className={styles.unreadDot} />}
            </div>
          );
        })}
    </div>
  );
}
