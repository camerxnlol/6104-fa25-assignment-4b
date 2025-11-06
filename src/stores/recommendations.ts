import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecommendationsStore = defineStore('recommendations', () => {
  const songs = ref<string[]>([]);

  function setRecommendations(list: string[]) {
    songs.value = Array.isArray(list) ? list : [];
  }

  function clearRecommendations() {
    songs.value = [];
  }

  return {
    songs,
    setRecommendations,
    clearRecommendations,
  };
});


