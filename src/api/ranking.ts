import apiClient from './client';

export interface RankedSong {
  songId: string;
  score: number;
}

export const rankingApi = {
  async addComparison(
    user: string,
    songA: string,
    songB: string | undefined,
    preferred: string
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
    const response = await apiClient.post('/Ranking/_getRankingsByAuthor', { authorId: user });
    console.log('rankingApi.getRankings response →', response.data);
    const normalize = (data: unknown): { rankedSongs: RankedSong[] } => {
      if (Array.isArray(data)) {
        return { rankedSongs: data as RankedSong[] };
      }
      if (data && typeof data === 'object' && Array.isArray((data as any).rankedSongs)) {
        return { rankedSongs: (data as any).rankedSongs as RankedSong[] };
      }
      return { rankedSongs: [] as RankedSong[] };
    };
    if (response.data && typeof response.data.error === 'string') {
      // throw new Error(response.data.error);
      console.error('Error fetching rankings:', response.data.error);
      return { rankedSongs: [] as RankedSong[] };
    }
    return normalize(response.data);
  },
};

