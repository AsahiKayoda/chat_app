// app/chat/services/chatService.ts
// API通信をまとめる層
import api from '@/lib/api';

export async function createOrGetRoom(targetUserId: number) {
  const res = await api.post('/chat-rooms', { target_user_id: targetUserId });
  return res.data.id;
}

export async function fetchMessages(roomId: number) {
  const res = await api.get(`/messages?room_id=${roomId}`);
  return res.data;
}

export async function sendMessage(roomId: number, text: string) {
  await api.post('/messages', { room_id: roomId, text });
}

export async function fetchUsers() {
  const res = await api.get('/users');
  return res.data;
}
