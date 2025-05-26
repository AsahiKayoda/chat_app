// ✅ useChatRoom.ts（roomId取得にconsole.log追加）
import { useState, useEffect } from 'react';
import { ChatRoom, User } from '../types/chat';
import {
  fetchChatRooms,
  fetchUsers,
  createGroup,
  createOrGetRoom,
} from '../services/chatService';
import { fetchCurrentUser } from '../services/chatService';

export function useChatRoom() {
  const [users, setUsers] = useState<(User & { roomId?: number })[]>([]);
  const [groups, setGroups] = useState<ChatRoom[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatRoom | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ 初期データ読み込み
  useEffect(() => {
    const initialize = async () => {
      try {
        const [userList, roomList, currentUser] = await Promise.all([
          fetchUsers(),
          fetchChatRooms(),
          fetchCurrentUser(),
        ]);

        // 他ユーザーに対して roomId を取得
        const extendedUsers = await Promise.all(
          userList.map(async (user) => {
            if (user.id === currentUser.id) return user;
            try {
              const id = await createOrGetRoom(user.id);
              //console.log(`✅ roomId取得 user=${user.name} id=${id}`);
              return { ...user, roomId: id };
            } catch (err) {
              //console.warn(`❌ roomId取得失敗 user_id=${user.id}`, err);
              return user;
            }
          })
        );

        setUsers(extendedUsers);
        setGroups(roomList);
      } catch (err) {
        console.error('❌ 初期データ取得失敗:', err);
        setError('初期データの取得に失敗しました');
      }
    };

    initialize();
  }, []);

  const handleSelectUser = async (user: User) => {
    try {
      const id = await createOrGetRoom(user.id);
      //console.log(`📌 選択されたユーザー ${user.name} → roomId=${id}`);
      setSelectedUser(user);
      setSelectedGroup(null);
      setRoomId(id);
    } catch (err) {
      //console.error('❌ ルーム取得エラー:', err);
      setError('ユーザーとのルームを取得できませんでした');
    }
  };

  const handleSelectGroup = (group: ChatRoom) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setRoomId(group.id);
  };

  const createGroupWrapper = async (roomName: string, memberIds: number[]) => {
    try {
      const newGroup = await createGroup(roomName, memberIds);
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setSelectedUser(null);
      setRoomId(newGroup.id);
    } catch (err) {
      console.error('❌ グループ作成エラー:', err);
      setError('グループ作成に失敗しました');
    }
  };

  return {
    users,
    groups,
    selectedUser,
    selectedGroup,
    roomId,
    error,
    handleSelectUser,
    handleSelectGroup,
    createGroup: createGroupWrapper,
  };
}
