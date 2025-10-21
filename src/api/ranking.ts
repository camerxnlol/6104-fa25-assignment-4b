import apiClient from './client';

export interface RankedSong {
  songId: string;
  score: number;
}

export const rankingApi = {
  async addComparison(
    user: string,
    songA: string,
    preferred: string,
    songB?: string
  ) {
    const response = await apiClient.post('/Ranking/addComparison', {
      user,
      songA,
      songB,
      preferred,
    });
    return response.data;
  },

  async remove(user: string, song: string) {
    const response = await apiClient.post('/Ranking/remove', { user, song });
    return response.data;
  },

  async getRankings(user: string) {
    const response = await apiClient.post('/Ranking/_getRankings', { user });
    if (response.data && typeof response.data.error === 'string') {
      // throw new Error(response.data.error);
      console.error('Error fetching rankings:', response.data.error);
      return { rankedSongs: [] as RankedSong[] };
    }
    return response.data as { rankedSongs: RankedSong[] };
  },
};

