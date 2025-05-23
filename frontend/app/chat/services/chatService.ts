// app/chat/services/chatService.ts
import api from '@/lib/api';
import { ChatRoom, User, Message } from '../types/chat';

export async function createOrGetRoom(targetUserId: number): Promise<number> {
  const res = await api.post('/chat-rooms', { target_user_id: targetUserId });
  return res.data.id;
}

export async function fetchMessages(roomId: number): Promise<Message[]> {
  const res = await api.get(`/messages?room_id=${roomId}`);
  return res.data;
}

export async function sendMessage(roomId: number, text: string): Promise<void> {
  await api.post('/messages', { room_id: roomId, text });
}

export async function fetchUsers(): Promise<User[]> {
  const res = await api.get('/users');
  return res.data;
}

export async function fetchChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get('/chat-rooms');

  // snake_case → camelCase にマッピング
  return res.data.map((room: any) => ({
    id: room.id,
    roomName: room.room_name,
    isGroup: room.is_group,
    createdAt: room.created_at,
  }));
}

export async function createGroup(roomName: string, memberIds: number[]): Promise<ChatRoom> {
  const res = await api.post('/chat-rooms/groups', {
    room_name: roomName,
    member_ids: memberIds,
  });

  return {
    id: res.data.id,
    roomName: res.data.room_name,
    isGroup: res.data.is_group,
    createdAt: res.data.created_at,
  };
}

export async function fetchCurrentUser(): Promise<{ id: number; name: string }> {
  const res = await api.get('/me');
  return res.data;
}

export async function markMessageAsRead(messageId: number): Promise<void> {
  try {
    await api.post(`/messages/${messageId}/read`);
  } catch (err) {
    console.error('📛 markMessageAsRead failed:', err);
  }
}
