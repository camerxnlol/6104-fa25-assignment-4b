import apiClient from './client';

export interface Reaction {
  _id: string;
  post: string;
  reactionType: string;
  reactingUser: string;
}

export const reactionApi = {
  async add(post: string, reactionType: string, reactingUser: string) {
    const response = await apiClient.post('/Reaction/add', {
      post,
      reactionType,
      reactingUser,
    });
    return response.data as { reactionId: string };
  },

  async remove(post: string, reactionType: string, reactingUser: string) {
    const response = await apiClient.post('/Reaction/remove', {
      post,
      reactionType,
      reactingUser,
    });
    return response.data;
  },

  async getReactionsForPost(post: string) {
    const response = await apiClient.post('/Reaction/_getReactionsForPost', {
      post,
    });
    const raw = response.data as unknown;
    let list: unknown[] = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === 'object' && Array.isArray((raw as any).reactions)) {
      list = (raw as any).reactions as unknown[];
    }
    // Normalize to { reactions: Reaction }[]
    const normalized = (list as unknown[]).map((item) => {
      if (item && typeof item === 'object' && 'reactions' in (item as any)) {
        return item as { reactions: Reaction };
      }
      return { reactions: item as Reaction };
    });
    return normalized as Array<{ reactions: Reaction }>;
  },

  async getReactionsByPostAndUser(post: string, reactingUser: string) {
    const response = await apiClient.post(
      '/Reaction/_getReactionsByPostAndUser',
      {
        post,
        reactingUser,
      }
    );
    const raw = response.data as unknown;
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : (raw && typeof raw === 'object' && Array.isArray((raw as any).reactions))
        ? (raw as any).reactions as unknown[]
        : [];
    const normalized = (list as unknown[]).map((item) => {
      if (item && typeof item === 'object' && 'reactions' in (item as any)) {
        return item as { reactions: Reaction };
      }
      return { reactions: item as Reaction };
    });
    return normalized as Array<{ reactions: Reaction }>;
  },
};

