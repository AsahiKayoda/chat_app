'use client';

import styles from '../chat.module.css';
import { User } from '../types/chat';
import { useState, useEffect } from 'react';

type Props = {
  users: User[]; // 全ユーザー一覧（自分を含む）
  currentUserId: number; // 現在ログイン中のユーザーのID
  onCreate: (groupName: string, memberIds: number[]) => void; // グループ作成時のコールバック
  onClose: () => void; // モーダルを閉じるコールバック
};

export default function CreateGroupModal({
  users,
  currentUserId,
  onCreate,
  onClose,
}: Props) {
  // グループ名の状態
  const [groupName, setGroupName] = useState('');

  // 選択されたユーザーのID一覧（初期状態で自分を含める）
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 初回マウント時に、自分を選択済み状態にする
  useEffect(() => {
    setSelectedIds([currentUserId]);
  }, [currentUserId]);

  // メンバー選択のON/OFF切り替え処理
  const toggleMember = (id: number) => {
    // 自分は選択状態を変更できない
    if (id === currentUserId) return;

    // 既に含まれていれば除外、含まれていなければ追加
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // 「作成」ボタン押下時の処理
  const handleSubmit = () => {
    // グループ名の未入力チェック
    if (!groupName.trim()) {
      alert('グループ名を入力してください');
      return;
    }

    // 最低2人（自分＋1人）選ばれているか確認
    if (selectedIds.length < 2) {
      alert('2人以上選択してください');
      return;
    }

    // グループ作成処理を実行（親コンポーネントに通知）
    onCreate(groupName, selectedIds);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>グループ作成</h2>

        {/* グループ名入力欄 */}
        <input
          type="text"
          placeholder="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* ユーザー一覧（チェックボックス） */}
        <div className={styles.userList}>
          {users.map((user) => (
            <label key={user.id}>
              <input
                type="checkbox"
                className={styles.checkbox}
                // 自分は常にON状態にし、変更不可
                checked={
                  user.id === currentUserId
                    ? true
                    : selectedIds.includes(user.id)
                }
                onChange={() => toggleMember(user.id)}
                disabled={user.id === currentUserId}
              />
              {user.name}
              {/* 自分であることを明示的に表示 */}
              {user.id === currentUserId && (
                <span className={styles.currentUser}>（自分）</span>
              )}
            </label>
          ))}
        </div>

        {/* 操作ボタン：作成／閉じる */}
        <div className={styles.modalActions}>
          <button onClick={handleSubmit}>作成</button>
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
