'use client'

import { Mention } from '../types/chat'
import styles from '../chat.module.css'

type Props = {
  mentions: Mention[]
  onClose: () => void
}

export default function MentionModal({ mentions, onClose }: Props) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>メンション通知一覧</h3>

        {mentions.length === 0 ? (
          <p>未通知のメンションはありません。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mentions.map((m) => (
              <li
                key={m.message_id}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <div><strong>メッセージ：</strong>{m.content}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ルームID: {m.room_id} | 送信者ID: {m.sender_id} | 日時: {new Date(m.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.logoutButton}>閉じる</button>
        </div>
      </div>
    </div>
  )
}
