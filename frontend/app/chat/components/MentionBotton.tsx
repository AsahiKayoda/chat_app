'use client'

import { Bell } from 'lucide-react'

type Props = {
  count: number
  onClick: () => void
}

export default function MentionButton({ count, onClick }: Props) {
  return (
    <div style={{ position: 'relative', marginRight: '10px', cursor: 'pointer' }} onClick={onClick}>
      <Bell />
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '50%',
          padding: '2px 6px',
          fontSize: '12px',
        }}>
          {count}
        </span>
      )}
    </div>
  )
}
