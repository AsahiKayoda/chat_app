// app/chat/UserList.tsx
'use client' 

import styles from '../chat.module.css'; 
import { User } from '../types/chat';

// ✅ 親コンポーネントから渡される props の型定義
type Props = {
  users: User[];
  selectedUser: User | null; // 現在選択されているユーザー（null の場合は未選択）
  onSelectUser: (user: User) => void; // ユーザーを選択したときに呼び出される関数
  currentUserId: number; // 👈 追加
};

// ✅ ユーザー一覧を表示する UI コンポーネント
export default function UserList({ users, selectedUser, onSelectUser, currentUserId, }: Props) {

  return (
    <div className={styles.sidebar}>
      <h3>ユーザー一覧</h3>
      {users
      .filter((user) => user.id !== currentUserId)
      .map((user) => (
        <div
          key={user.id} // ✅ React の仮想DOMで効率的に再描画するために必要
          className={styles.user}
          onClick={() => onSelectUser(user)} // ✅ ユーザーをクリックしたときに親へ通知（選択状態を更新）
          style={{
            // ✅ 現在選択中のユーザーの場合は背景色を変更（選択中であることが視覚的にわかる）
            backgroundColor: selectedUser?.id === user.id ? '#cce5ff' : undefined,
          }}
        >
          {user.name} {/* ✅ ユーザー名を表示 */}
        </div>
      ))}
    </div>
  );
}
