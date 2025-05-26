// ✅ UserList.tsx（型変換とログ追加で未読バッジを確実に表示）
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

export default function UserList({
  users,
  selectedUser,
  onSelectUser,
  currentUserId,
  unreadRoomIds = new Set(),
}: Props) {
  //console.log("🧪 UserList users:", users);
  //console.log("🧪 UnreadRoomIds:", Array.from(unreadRoomIds));

  return (
    <div className={styles.sidebar}>
      <h3>ユーザー一覧</h3>
      {users
        .filter((user) => user.id !== currentUserId)
        .map((user) => {
          const roomIdNum = Number(user.roomId);
          const hasUnread = !!roomIdNum && unreadRoomIds.has(roomIdNum);

          //console.log("🔍 user:", user.name, "roomId:", user.roomId, "型:", typeof user.roomId, "→ hasUnread:", hasUnread);

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
