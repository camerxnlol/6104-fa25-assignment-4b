import apiClient from './client';

export interface VerifyFriendshipResult {
  isFriend: boolean;
}

export const friendsApi = {
  async sendFriendRequest(sender: string, recipient: string) {
    const response = await apiClient.post('/Friends/sendFriendRequest', {
      sender,
      recipient,
    });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async acceptFriendRequest(recipient: string, sender: string) {
    const response = await apiClient.post('/Friends/acceptFriendRequest', {
      recipient,
      sender,
    });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async rejectFriendRequest(recipient: string, sender: string) {
    const response = await apiClient.post('/Friends/rejectFriendRequest', {
      recipient,
      sender,
    });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async removeFriend(user1: string, user2: string) {
    const response = await apiClient.post('/Friends/removeFriend', {
      user1,
      user2,
    });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async verifyFriendship(user1: string, user2: string) {
    const response = await apiClient.post('/Friends/_verifyFriendship', {
      user1,
      user2,
    });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const arr = response.data as Array<VerifyFriendshipResult>;
    return Array.isArray(arr) && arr.length ? !!arr[0].isFriend : false;
  },

  async getFriends(user: string) {
    const response = await apiClient.post('/Friends/_getFriends', { user });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const arr = response.data as Array<{ friends: string[] }>;
    return (Array.isArray(arr) && arr[0]?.friends) ? arr[0].friends : [];
  },

  async getSentRequests(user: string) {
    const response = await apiClient.post('/Friends/_getSentRequests', { user });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const arr = response.data as Array<{ recipients: string[] }>;
    return (Array.isArray(arr) && arr[0]?.recipients) ? arr[0].recipients : [];
  },

  async getReceivedRequests(user: string) {
    const response = await apiClient.post('/Friends/_getReceivedRequests', { user });
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const arr = response.data as Array<{ senders: string[] }>;
    return (Array.isArray(arr) && arr[0]?.senders) ? arr[0].senders : [];
  },
};


