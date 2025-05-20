'use client'

import styles from '../chat.module.css'
import { ChatRoom } from '../types/chat'

type Props = {
  groups: ChatRoom[]
  selectedGroup: ChatRoom | null
  onSelectGroup: (group: ChatRoom) => void
  onCreateGroup?: () => void
}

export default function GroupList({ groups, selectedGroup, onSelectGroup, onCreateGroup }: Props) {
  console.log('📦 GroupList: groups:', groups);  
  return (
    <div className={styles.sidebar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>グループ一覧</h3>
        <button onClick={onCreateGroup} className={styles.createButton}>＋</button>
      </div>

      {groups
        .filter((group) => group.isGroup === true) 
        .map((group) => (
          <div
            key={group.id}
            className={styles.user}
            onClick={() => onSelectGroup(group)}
            style={{
              backgroundColor: selectedGroup?.id === group.id ? '#cce5ff' : undefined,
            }}
          >
            {group.roomName || '（名称未設定）'}
          </div>
        ))}
    </div>
  )
}
