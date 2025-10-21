import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecommendationsStore = defineStore('recommendations', () => {
  const songs = ref<string[]>([]);
  const STORAGE_KEY = 'recommendations.songs';

  function setRecommendations(list: string[]) {
    songs.value = Array.isArray(list) ? list : [];
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(songs.value));
      }
    } catch (_) {
      // ignore
    }
  }

  function clearRecommendations() {
    songs.value = [];
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {
      // ignore
    }
  }

  // Load any saved recommendations (helps across navigation/reloads)
  try {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) songs.value = parsed as string[];
      }
    }
  } catch (_) {
    // ignore
  }

  return {
    songs,
    setRecommendations,
    clearRecommendations,
  };
});


