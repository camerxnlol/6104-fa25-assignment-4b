import apiClient from './client';

export const songRecommenderApi = {
  async addSongToCatalog(userId: string, songId: string) {
    const response = await apiClient.post('/SongRecommender/addSongToCatalog', {
      userId,
      songId,
    });
    return response.data;
  },

  async generateRecommendation(userId: string, count: number) {
    const response = await apiClient.post(
      '/SongRecommender/generateRecommendation',
      {
        userId,
        count,
      }
    );
    return response.data as { recommendedSongs: string[] };
  },

  async removeSongsFromCatalog(userId: string, songIds: string[]) {
    const response = await apiClient.post('/SongRecommender/removeSongsFromCatalog', {
      userId,
      songIds,
    });
    return response.data;
  },

  async removeSongsFromPastRecommendations(userId: string, songIds: string[]) {
    const response = await apiClient.post('/SongRecommender/removeSongsFromPastRecommendations', {
      userId,
      songIds,
    });
    return response.data;
  },

  async getPastRecommendations(userId: string) {
    const response = await apiClient.post('/SongRecommender/getPastRecommendations', {
      userId,
    });
    // API returns a raw array of strings per spec
    return response.data as string[];
  },

  async getNotYetRecommendedSongs(userId: string) {
    const response = await apiClient.post('/SongRecommender/getNotYetRecommendedSongs', {
      userId,
    });
    return response.data as { notYetRecommendedSongs: string[] };
  },
};

