'use client';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ ユーザー一覧を取得する非同期関数
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users'); // トークンは自動付与（axiosインターセプター）
        setUsers(res.data);                 // ユーザー一覧を状態にセット
      } catch (err: any) {
        console.error('ユーザー取得失敗:', err);

        // エラー内容に応じたメッセージ表示
        const status = err.response?.status;
        if (status === 401) {
          setError('認証エラー：ログインし直してください');
        } else {
          setError('ユーザー一覧の取得に失敗しました');
        }
      } finally {
        setLoading(false); // ローディング終了
      }
    };

    fetchUsers();
  }, []);

  // ✅ ローディング中の表示
  if (loading) return <div className={styles.sidebar}>読み込み中...</div>;

  // ✅ エラー時の表示
  if (error) return <div className={styles.sidebar} style={{ color: 'red' }}>{error}</div>;

  // ✅ 通常のユーザー一覧表示
  return (
    <div className={styles.sidebar}>
      <h3>ユーザー一覧</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className={styles.user}
          onClick={() => onSelectUser(user)} // ✅ クリック時にユーザーを選択
          style={{
            backgroundColor: selectedUser?.id === user.id ? '#cce5ff' : undefined, // 選択中の背景色
          }}
        >
          {user.name}
        </div>
      ))}
    </div>
  );
}
