export type GeneralChatMessage = { id: string; text: string; name: string; role: string; createdAt: string };

export const mergeGeneralChatMessages = (...lists: GeneralChatMessage[][]): GeneralChatMessage[] => {
  const unique = new Map<string, GeneralChatMessage>();
  for (const list of lists) for (const message of list) unique.set(message.id, message);
  return [...unique.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).slice(-50);
};
