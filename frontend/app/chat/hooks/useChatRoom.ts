// app/chat/hooks/useChatRoom.ts
import { useEffect, useState } from 'react';
import { User, Message } from '../types/chat';
import * as chatService from '../services/chatService';

export function useChatRoom() {
  // ✅ 選択された相手ユーザー
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ✅ 現在のチャットルームID（選択ユーザーと1:1のルーム）
  const [roomId, setRoomId] = useState<number | null>(null);

  // ✅ メッセージ一覧
  const [messages, setMessages] = useState<Message[]>([]);

  // ✅ ユーザー一覧（相手候補）
  const [users, setUsers] = useState<User[]>([]);

  // ✅ エラーメッセージ表示用
  const [error, setError] = useState('');

  // ✅ 初回マウント時にユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await chatService.fetchUsers();
        setUsers(data);
      } catch (err) {
        setError('ユーザー一覧の取得に失敗しました');
      }
    };

    fetchUsers();
  }, []);
  
  useEffect(() => {
    const autoSelectFirstUser = async () => {
      if (users.length > 0 && !selectedUser) {
        try {
          handleSelectUser(users[0]);
        } catch (err) {
          setError('初期ユーザーのチャットルーム取得に失敗しました');
        }
      }
    };
    autoSelectFirstUser();
  }, [users, selectedUser]);

  // ✅ roomId が更新されたときにメッセージを取得
  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
    }
  }, [roomId]);

  // ✅ ユーザーが選択されたときにルームを作成または取得
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setMessages([]); // メッセージ一覧を一旦クリア

    try {
      const id = await chatService.createOrGetRoom(user.id);
      setRoomId(id);
    } catch (err) {
      setError('チャットルームの取得に失敗しました');
    }
  };

  // ✅ メッセージ一覧を取得する関数
  const fetchMessages = async (roomId: number) => {
    try {
      const data = await chatService.fetchMessages(roomId);
      setMessages(data);
    } catch (err) {
      setError('メッセージの取得に失敗しました');
    }
  };

  // ✅ メッセージ送信
  const handleSendMessage = async (text: string) => {
    if (!roomId) return;

    try {
      await chatService.sendMessage(roomId, text);
      await fetchMessages(roomId); // ✅ 送信後に一覧を更新（後でWebSocketに置き換える余地あり）
    } catch (err) {
      setError('メッセージの送信に失敗しました');
    }
  };

  return {
    users,
    selectedUser,
    roomId,
    messages,
    error,
    handleSelectUser,
    handleSendMessage,
  };
}
