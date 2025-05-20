'use client';

import styles from '../chat.module.css';
import { User } from '../types/chat';
import { useState, useEffect } from 'react';

type Props = {
  users: User[];
  currentUserId: number;
  onCreate: (groupName: string, memberIds: number[]) => void;
  onClose: () => void;
};

export default function CreateGroupModal({
  users,
  currentUserId,
  onCreate,
  onClose,
}: Props) {
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ✅ 初期で自分を選択済みにしておく
  useEffect(() => {
    setSelectedIds([currentUserId]);
  }, [currentUserId]);

  const toggleMember = (id: number) => {
    if (id === currentUserId) return; // ✅ 自分は選択変更できない
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!groupName.trim()) return alert('グループ名を入力してください');
    if (selectedIds.length < 2) return alert('2人以上選択してください');
    onCreate(groupName, selectedIds);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>グループ作成</h2>
        <input
          type="text"
          placeholder="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className={styles.userList}>
          {users.map((user) => (
            <label key={user.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(user.id)}
                onChange={() => toggleMember(user.id)}
                disabled={user.id === currentUserId} // ✅ 自分は変更不可
              />
              {user.name} {user.id === currentUserId && '（自分）'}
            </label>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={handleSubmit}>作成</button>
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
