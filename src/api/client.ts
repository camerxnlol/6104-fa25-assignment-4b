import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentSession: unknown = null;

export function setApiSession(session: unknown | null) {
  currentSession = session ?? null;
}

const EXCLUDED_SESSION_PATHS = [
  '/UserAuthentication/register',
  '/UserAuthentication/authenticate',
  '/UserAuthentication/_getUserByUsername',
  '/UserAuthentication/_getUsername',
];

apiClient.interceptors.request.use((config) => {
  try {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    const isExcluded = EXCLUDED_SESSION_PATHS.some((p) => url.includes(p));
    if (!isExcluded && method === 'post' && currentSession != null) {
      const body = config.data;
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        config.data = { ...body, session: currentSession };
      }
    }
  } catch (_) {
    // no-op on interceptor errors; request proceeds as-is
  }
  return config;
});

export default apiClient;

