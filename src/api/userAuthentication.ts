import apiClient from './client';

export const userAuthApi = {
  async register(username: string, password: string) {
    const response = await apiClient.post('/UserAuthentication/register', {
      username,
      password,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data as { user: string };
  },

  async authenticate(username: string, password: string) {
    const response = await apiClient.post('/UserAuthentication/authenticate', {
      username,
      password,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data as { user: string };
  },

  async delete(user: string) {
    const response = await apiClient.post('/UserAuthentication/delete', {
      user,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data;
  },

  async changePassword(user: string, oldPassword: string, newPassword: string) {
    const response = await apiClient.post('/UserAuthentication/changePassword', {
      user,
      oldPassword,
      newPassword,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data;
  },

  async changeUsername(user: string, newUsername: string, password: string) {
    const response = await apiClient.post('/UserAuthentication/changeUsername', {
      user,
      newUsername,
      password,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data;
  },

  async getUserByUsername(username: string) {
    const response = await apiClient.post(
      '/UserAuthentication/_getUserByUsername',
      { username }
    );
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data as Array<{ user: string }>;
  },

  async getUsername(user: string) {
    const response = await apiClient.post('/UserAuthentication/_getUsername', {
      user,
    });
    if ((response.data as any)?.error) {
      throw new Error((response.data as any).error);
    }
    return response.data as Array<{ username: string }>;
  },
};

