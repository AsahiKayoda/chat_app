// app/chat/types/chat.ts
// 型定義（User, Messageなど）

export type User = {
  id: number;
  name: string;
};

export type Message = {
  id: number;
  text: string;
  sender_id: number;
  room_id: number;
  timestamp: string;
};
