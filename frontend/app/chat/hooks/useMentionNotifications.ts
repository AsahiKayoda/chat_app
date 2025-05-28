// ✅ 5秒ごとのポーリング処理を作成
'use client';

import { useEffect, useState } from "react"
import { Mention } from '../types/chat';

export const useMentionNotifications = () => {
  const [mentions, setMentions] = useState<Mention[]>([])

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const res = await fetch("/api/mentions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        if (!res.ok) return
        const data = await res.json()
        setMentions(data)
      } catch (e) {
        console.error("mention fetch error", e)
      }
    }

    fetchMentions()
    const interval = setInterval(fetchMentions, 5000)
    return () => clearInterval(interval)
  }, [])

  return mentions
}
