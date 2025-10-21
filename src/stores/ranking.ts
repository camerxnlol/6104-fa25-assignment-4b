import { defineStore } from 'pinia';
import { ref } from 'vue';
import { rankingApi, type RankedSong } from '../api';

export const useRankingStore = defineStore('ranking', () => {
  const rankings = ref<RankedSong[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function addComparison(
    userId: string,
    songA: string,
    songB: string,
    preferred: string
  ) {
    loading.value = true;
    error.value = null;
    try {
      await rankingApi.addComparison(userId, songA, songB, preferred);
      // Refresh rankings after comparison
      await fetchRankings(userId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add comparison';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRankings(userId: string) {
    loading.value = true;
    error.value = null;
    try {
      rankings.value = await rankingApi.getRankings(userId);
      return rankings.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch rankings';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeSong(userId: string, songId: string) {
    loading.value = true;
    error.value = null;
    try {
      await rankingApi.remove(userId, songId);
      rankings.value = rankings.value.filter((song) => song.songId !== songId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove song';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    rankings,
    loading,
    error,
    addComparison,
    fetchRankings,
    removeSong,
  };
});

