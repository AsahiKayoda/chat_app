'use client'

import styles from '../chat.module.css'
import { ChatRoom } from '../types/chat'

type Props = {
  groups: ChatRoom[]
  selectedGroup: ChatRoom | null
  onSelectGroup: (group: ChatRoom) => void
  onCreateGroup?: () => void
  unreadRoomIds?: Set<number>
}

export default function GroupList({ groups, selectedGroup, onSelectGroup, onCreateGroup, unreadRoomIds = new Set() }: Props) {
  return (
    <div className={styles.sidebar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>グループ一覧</h3>
        <button onClick={onCreateGroup} className={styles.createButton}>＋</button>
      </div>

      {groups
        .filter((group) => group.isGroup === true)
        .map((group) => {
          const hasUnread = unreadRoomIds.has(group.id);

          return (
            <div
              key={group.id}
              className={styles.user}
              onClick={() => onSelectGroup(group)}
              style={{
                backgroundColor: selectedGroup?.id === group.id ? '#cce5ff' : undefined,
              }}
            >
              {group.roomName || '（名称未設定）'}
              {hasUnread && <span className={styles.unreadDot} />}
            </div>
          );
        })}
    </div>
  )
}
