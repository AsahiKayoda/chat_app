
const getKey = (userId: number) => `hiddenMessageIds_user_${userId}`;

export const getHiddenMessageIds = (userId: number): number[] => {
  const data = localStorage.getItem(getKey(userId));
  return data ? JSON.parse(data) : [];
};

export const addHiddenMessageId = (userId: number, messageId: number) => {
  const current = getHiddenMessageIds(userId);
  const updated = [...new Set([...current, messageId])];
  localStorage.setItem(getKey(userId), JSON.stringify(updated));
};
