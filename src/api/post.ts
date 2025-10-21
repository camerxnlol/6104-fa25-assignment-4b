import apiClient from './client';

export interface Post {
  _id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export const postApi = {
  async create(userId: string, content: string, timestamp: string) {
    const response = await apiClient.post('/Post/create', {
      userId,
      content,
      timestamp,
    });
    return response.data;
  },

  async delete(post: string) {
    const response = await apiClient.post('/Post/delete', { post });
    return response.data;
  },

  async getPostsByAuthor(authorId: string) {
    const response = await apiClient.post('/Post/_getPostsByAuthor', {
      authorId,
    });
    return response.data as Array<{ post: Post }>;
  },

  async getPostById(postId: string) {
    const response = await apiClient.post('/Post/_getPostById', { postId });
    return response.data as Array<{ post: Post }>;
  },
};

