// app/chat/UserList.tsx
'use client'

import { useEffect, useState } from 'react';
import styles from './chat.module.css';
import api from '@/lib/api';
import { User } from './page';

type Props = {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
};

export default function UserList({ selectedUser, onSelectUser }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        setError('ユーザー取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className={styles.sidebar}>読み込み中...</div>;
  if (error) return <div className={styles.sidebar} style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.sidebar}>
      <h3>ユーザー一覧</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className={styles.user}
          onClick={() => onSelectUser(user)}
          style={{
            backgroundColor: selectedUser?.id === user.id ? '#cce5ff' : undefined,
          }}
        >
          {user.name}
        </div>
      ))}
    </div>
  );
}
