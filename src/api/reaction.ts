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
    return response.data as Array<{ reactions: Reaction }>;
  },

  async getReactionsByPostAndUser(post: string, reactingUser: string) {
    const response = await apiClient.post(
      '/Reaction/_getReactionsByPostAndUser',
      {
        post,
        reactingUser,
      }
    );
    return response.data as Array<{ reactions: Reaction }>;
  },
};

