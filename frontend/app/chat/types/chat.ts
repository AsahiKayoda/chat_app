// app/chat/types/chat.ts
// 型定義（User, Messageなど）

export type User = {
  id: number;
  name: string;
};

export type Attachment = {
  id: number;
  message_id: number;
  file_name: string;
  url: string;
  created_at: string;
};

export type Message = {
  id: number;
  text: string;
  sender_id: number;
  room_id: number;
  timestamp: string;
  is_read?: boolean;
  attachments: Attachment[];
};

export type ChatRoom = {
  id: number
  roomName: string
  isGroup: boolean
  createdAt: string
}
