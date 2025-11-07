import apiClient from './client';

export interface VerifyFriendshipResult {
  isFriend: boolean;
}

export const friendsApi = {
  async sendFriendRequest(sender: string, recipient: string) {
    console.log('friendsApi.sendFriendRequest request →', { sender, recipient });
    const response = await apiClient.post('/Friends/sendFriendRequest', {
      sender,
      recipient,
    });
    console.log('friendsApi.sendFriendRequest response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async acceptFriendRequest(recipient: string, sender: string) {
    console.log('friendsApi.acceptFriendRequest request →', { recipient, sender });
    const response = await apiClient.post('/Friends/acceptFriendRequest', {
      recipient,
      sender,
    });
    console.log('friendsApi.acceptFriendRequest response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async rejectFriendRequest(recipient: string, sender: string) {
    console.log('friendsApi.rejectFriendRequest request →', { recipient, sender });
    const response = await apiClient.post('/Friends/rejectFriendRequest', {
      recipient,
      sender,
    });
    console.log('friendsApi.rejectFriendRequest response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async removeFriend(user1: string, user2: string) {
    console.log('friendsApi.removeFriend request →', { user1, user2 });
    const response = await apiClient.post('/Friends/removeFriend', {
      user1,
      user2,
    });
    console.log('friendsApi.removeFriend response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    return response.data as { success: boolean };
  },

  async verifyFriendship(user1: string, user2: string) {
    console.log('friendsApi.verifyFriendship request →', { user1, user2 });
    const response = await apiClient.post('/Friends/_verifyFriendship', {
      user1,
      user2,
    });
    console.log('friendsApi.verifyFriendship response raw →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const raw = response.data as unknown;
    // Accept shapes:
    // - boolean
    // - { isFriend: boolean }
    // - [{ isFriend: boolean }]
    // - [boolean]
    if (typeof raw === 'boolean') return raw;
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw)) {
        const first = (raw as any)[0];
        if (typeof first === 'boolean') return first;
        if (first && typeof first === 'object' && 'isFriend' in first) {
          return Boolean((first as any).isFriend);
        }
        return false;
      }
      if ('isFriend' in (raw as any)) {
        return Boolean((raw as any).isFriend);
      }
    }
    return false;
  },

  async getFriends(user: string) {
    console.log('friendsApi.getFriends request →', { user });
    const response = await apiClient.post('/Friends/_getFriends', { user });
    console.log('friendsApi.getFriends response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const raw = response.data as unknown;
    // Support shapes: [{ friends: string[] }], { friends: string[] }, string[]
    if (Array.isArray(raw)) {
      if (raw.length && typeof (raw as any)[0] === 'string') return raw as string[];
      if ((raw as any)[0]?.friends && Array.isArray((raw as any)[0].friends)) {
        return (raw as any)[0].friends as string[];
      }
      return [];
    }
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).friends)) {
      return (raw as any).friends as string[];
    }
    return [];
  },

  async getSentRequests(user: string) {
    console.log('friendsApi.getSentRequests request →', { user });
    const response = await apiClient.post('/Friends/_getSentRequests', { user });
    console.log('friendsApi.getSentRequests response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const raw = response.data as unknown;
    // Support shapes: [{ recipients: string[] }], { recipients: string[] }, string[]
    if (Array.isArray(raw)) {
      if (raw.length && typeof (raw as any)[0] === 'string') return raw as string[];
      if ((raw as any)[0]?.recipients && Array.isArray((raw as any)[0].recipients)) {
        return (raw as any)[0].recipients as string[];
      }
      return [];
    }
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).recipients)) {
      return (raw as any).recipients as string[];
    }
    return [];
  },

  async getReceivedRequests(user: string) {
    console.log('friendsApi.getReceivedRequests request →', { user });
    const response = await apiClient.post('/Friends/_getReceivedRequests', { user });
    console.log('friendsApi.getReceivedRequests response →', response.data);
    if ((response.data as any)?.error) throw new Error((response.data as any).error);
    const raw = response.data as unknown;
    // Support shapes: [{ senders: string[] }], { senders: string[] }, string[]
    if (Array.isArray(raw)) {
      if (raw.length && typeof (raw as any)[0] === 'string') return raw as string[];
      if ((raw as any)[0]?.senders && Array.isArray((raw as any)[0].senders)) {
        return (raw as any)[0].senders as string[];
      }
      return [];
    }
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).senders)) {
      return (raw as any).senders as string[];
    }
    return [];
  },
};


