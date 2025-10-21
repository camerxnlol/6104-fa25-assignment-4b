import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { userAuthApi } from '../api';
import { handleApiError } from '../utils/errorHandler';

export const useAuthStore = defineStore('auth', () => {
  const STORAGE_KEY = 'auth.session';

  const userId = ref<string | null>(null);
  const username = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const error = ref<string | null>(null);

  function persistSession() {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        userId: userId.value,
        username: username.value,
        isAuthenticated: isAuthenticated.value,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // ignore persistence errors
    }
  }

  function loadSession() {
    try {
      if (typeof window === 'undefined') return;
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        userId: string | null;
        username: string | null;
        isAuthenticated: boolean;
      };
      userId.value = data.userId ?? null;
      username.value = data.username ?? null;
      isAuthenticated.value = Boolean(data.isAuthenticated);
    } catch (_) {
      // ignore load errors and treat as no session
    }
  }

  function clearSession() {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // ignore clear errors
    }
  }

  async function register(usernameValue: string, password: string) {
    error.value = null;
    try {
      const response = await userAuthApi.register(usernameValue, password);
      userId.value = response.user;
      username.value = usernameValue;
      isAuthenticated.value = true;
      persistSession();
      return response;
    } catch (err) {
      error.value = handleApiError(err);
      throw new Error(error.value);
    }
  }

  async function login(usernameValue: string, password: string) {
    error.value = null;
    try {
      const response = await userAuthApi.authenticate(usernameValue, password);
      userId.value = response.user;
      username.value = usernameValue;
      isAuthenticated.value = true;
      persistSession();
      return response;
    } catch (err) {
      error.value = handleApiError(err);
      throw new Error(error.value);
    }
  }

  function logout() {
    userId.value = null;
    username.value = null;
    isAuthenticated.value = false;
    error.value = null;
    clearSession();
  }

  // Keep session up-to-date if values change elsewhere
  watch([userId, username, isAuthenticated], persistSession);

  // Load any existing session on store init
  loadSession();

  return {
    userId,
    username,
    isAuthenticated,
    error,
    register,
    login,
    logout,
  };
});

