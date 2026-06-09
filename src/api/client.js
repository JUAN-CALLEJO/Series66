// Thin API client. Talks to the backend when reachable; callers fall
// back to local-only mode when it isn't (offline single-file build).
const TOKEN_KEY = 's66.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => request('/health', { auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  getProgress: () => request('/progress'),
  putProgress: (patch) => request('/progress', { method: 'PUT', body: patch }),
  getResults: () => request('/results'),
  addResult: (result) => request('/results', { method: 'POST', body: result }),
};

// Quick check whether the backend is up (used to show cloud vs local mode).
export async function pingBackend() {
  try {
    await api.health();
    return true;
  } catch {
    return false;
  }
}
