import { defineStore } from 'pinia';
import { ref } from 'vue';
import { postApi, type Post } from '../api';

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createPost(userId: string, content: string) {
    loading.value = true;
    error.value = null;
    try {
      const timestamp = new Date().toISOString();
      const response = await postApi.create(userId, content, timestamp);
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPostsByAuthor(authorId: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await postApi.getPostsByAuthor(authorId);
      posts.value = response.map((item) => item.post);
      return posts.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePost(postId: string) {
    loading.value = true;
    error.value = null;
    try {
      await postApi.delete(postId);
      posts.value = posts.value.filter((post) => post._id !== postId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    fetchPostsByAuthor,
    deletePost,
  };
});

