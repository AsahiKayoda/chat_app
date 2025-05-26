// ✅ グローバルWebSocket接続に最適化した useChatSocket.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '../types/chat';
import { getToken } from '@/lib/auth';
import { fetchMessages } from '../services/chatService';

export function useChatSocket(
  userId: number,
  setUnreadRoomIds: React.Dispatch<React.SetStateAction<Set<number>>>,
  currentRoomId: number | null
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // ✅ ルーム切替時にメッセージをRESTで取得（WebSocketとは独立）
  useEffect(() => {
    if (currentRoomId === null || userId === -1) return;

    fetchMessages(currentRoomId)
      .then((initialMessages) => {
        setMessages((prev) => {
          const others = prev.filter((msg) => msg.room_id !== currentRoomId);
          return [...others, ...initialMessages];
        });
      });
  }, [currentRoomId, userId]);

  // ✅ WebSocket接続は userId のみ依存（1回だけ接続）
  useEffect(() => {
    const token = getToken();
    if (!token || userId === -1) {
      console.warn('❌ WebSocket接続スキップ: トークンまたはuserIdが無効');
      return;
    }

    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket接続確立');
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === 'message') {
          const parsedRoomId = Number(parsed.room_id);

          const newMessage: Message = {
            id: parsed.id , // 仮ID fallback
            text: parsed.text,
            sender_id: parsed.user_id,
            room_id: parsedRoomId,
            timestamp: parsed.timestamp,
            is_read: false,
          };

          setMessages((prev) => [...prev, newMessage]);

          if (parsed.user_id !== userId && parsedRoomId !== currentRoomId) {
            setUnreadRoomIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(parsedRoomId);
              return newSet;
            });
          }
        } else if (parsed.type === 'read') {
          const readMessageIds: number[] = (parsed.message_ids || []).map(Number);

          setMessages((prev) =>
            prev.map((msg) => {
              if (
                msg.sender_id === userId &&
                readMessageIds.includes(Number(msg.id))
              ) {
                return { ...msg, is_read: true };
              }
              return msg;
            })
          );
        }
      } catch (e) {
        console.error('❌ WebSocketメッセージ解析エラー', e);
      }
    };

    socket.onclose = () => {
      console.log('❌ WebSocket切断');
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const sendMessage = (text: string, targetRoomId: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'message',
        user_id: userId,
        room_id: targetRoomId.toString(),
        text,
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const sendReadNotification = (roomId: number, messageIds: number[]) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'read',
        room_id: roomId.toString(),
        user_id: userId,
        message_ids: messageIds,
      };
      socketRef.current.send(JSON.stringify(payload));
      console.log('📤 WebSocket: read通知を送信しました', payload);
    }
  };

  return {
    messages,
    sendMessage,
    sendReadNotification,
  };
}