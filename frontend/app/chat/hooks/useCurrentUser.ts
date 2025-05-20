// app/chat/hooks/useCurrentUser.ts

import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../services/chatService';

export function useCurrentUser() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUserId(user.id);
      } catch (e) {
        setError('ログイン情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  return { currentUserId, loading, error };
}
