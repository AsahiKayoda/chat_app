'use client';

import { useEffect, useState } from 'react';
import { Message } from '../types/chat';
import { fetchMessages } from '../services/chatService';
import { getToken } from '@/lib/auth';

export function useChatSocket(roomId: number, userId: number) {
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
    try {
      console.log("📩 Raw WebSocket message:", event.data);

      let raw = event.data;

      // 「echo: { ... }」のような文字列だった場合に備えて取り除く
      if (raw.startsWith("echo: ")) {
        raw = raw.replace("echo: ", "");
      }

      const payload = JSON.parse(raw);

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
