'use client';

import { useEffect, useState } from 'react';
import { Message } from '../types/chat';
import { fetchMessages } from '../services/chatService';
import { getToken } from '@/lib/auth';

export function useChatSocket(roomId: number, userId: number ,setUnreadRoomIds?: React.Dispatch<React.SetStateAction<Set<number>>>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (roomId === -1) return;

    fetchMessages(roomId)
      .then(setMessages)
      .catch((err) => console.error("履歴取得に失敗:", err));
  }, [roomId]);

  useEffect(() => {
    if (roomId === -1 || userId === -1) return;

    const token = getToken();
    const ws = new WebSocket(`ws://localhost:8080/ws?room_id=${roomId}&token=${token}`);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      console.log("📩 Raw WebSocket message:", event.data); // ✅ このログが絶対出るべき！
    try {
      console.log("📩 Raw WebSocket message:", event.data);

      let raw = event.data;

      // 「echo: { ... }」のような文字列だった場合に備えて取り除く
      if (raw.startsWith("echo: ")) {
        raw = raw.replace("echo: ", "");
      }

      const payload = JSON.parse(raw);
      console.log("📦 payload:", payload); // ← payloadの中身を出力する

      if (payload.type === "message") {
        const msg: Message = {
          id: Date.now(),
          text: payload.text,
          sender_id: payload.user_id,
          room_id: parseInt(payload.room_id),
          timestamp: payload.timestamp,
        };
        setMessages((prev) => [...prev, msg]);
      }
      if (payload.type === "read") {
        console.log("📨 read event received:", payload.room_id);

        if (typeof setUnreadRoomIds === "function") {
          setUnreadRoomIds((prev) => {
            const updated = new Set(prev);
            updated.delete(Number(payload.room_id));
            return updated;
          });
        } else {
          console.warn("⚠️ setUnreadRoomIds not defined");
        }
      }


    } catch (err) {
      console.error("📛 JSON parse error:", err);
      console.warn("⚠️ 受信したデータ:", event.data);
    }
  };


    ws.onerror = (err) => console.error("WebSocket error:", err);

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId, userId]);

  const sendMessage = (text: string) => {
    const payload = {
      type: 'message',
      user_id: userId,
      room_id: String(roomId),
      text,
    };
    console.log("🚀 sendMessage payload:", payload);
    socket?.send(JSON.stringify(payload));
  };

  return { messages, sendMessage };
}
