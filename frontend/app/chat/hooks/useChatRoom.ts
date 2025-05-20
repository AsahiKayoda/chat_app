import { useEffect, useState } from 'react';
import { User, Message, ChatRoom } from '../types/chat';
import * as chatService from '../services/chatService';

export function useChatRoom() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<ChatRoom[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatRoom | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');

  // ユーザー一覧取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await chatService.fetchUsers();
        setUsers(data);
      } catch {
        setError('ユーザー一覧の取得に失敗しました');
      }
    };
    fetchUsers();
  }, []);

  // グループ一覧取得
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await chatService.fetchChatRooms();
        console.log('📦 ALL ROOMS:', data);
        const groupRooms = data.filter((r: ChatRoom) => r.isGroup === true);
        console.log('👥 GROUP ROOMS:', groupRooms);
        setGroups(groupRooms);
      } catch (err) {
        console.error('🚨 fetchChatRooms error', err);
        setError('グループ一覧の取得に失敗しました');
      }
    };
    fetchGroups();
  }, []);

  // メッセージ一覧取得（ルームID変更時）
  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
    }
  }, [roomId]);

  const fetchMessages = async (roomId: number) => {
    try {
      const data = await chatService.fetchMessages(roomId);
      setMessages(data);
    } catch {
      setError('メッセージの取得に失敗しました');
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setMessages([]);

    try {
      const id = await chatService.createOrGetRoom(user.id);
      setRoomId(id);
    } catch {
      setError('チャットルームの取得に失敗しました');
    }
  };

  const handleSelectGroup = async (group: ChatRoom) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setMessages([]);

    setRoomId(group.id); // グループはIDが既にある
  };

  const handleSendMessage = async (text: string) => {
    if (!roomId) return;
    try {
      await chatService.sendMessage(roomId, text);
      await fetchMessages(roomId);
    } catch {
      setError('メッセージの送信に失敗しました');
    }
  };

  const createGroup = async (name: string, memberIds: number[]) => {
    try {
      await chatService.createGroup(name, memberIds);
      const data = await chatService.fetchChatRooms();
      const filtered = data.filter((r: ChatRoom) => r.isGroup === true);
      setGroups(filtered);
    } catch {
      setError('グループ作成に失敗しました');
    }
  };

  return {
    users,
    groups,
    selectedUser,
    selectedGroup,
    roomId,
    messages,
    error,
    handleSelectUser,
    handleSelectGroup,
    handleSendMessage,
    createGroup,
  };
}
