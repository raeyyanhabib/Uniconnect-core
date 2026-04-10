// api.ts — Fetch wrapper with JWT authentication
// All API calls go through these helpers to automatically attach the auth token.

let token: string | null = localStorage.getItem('uc_token');

/** Store the JWT token (called after login) */
export function setToken(t: string | null) {
  token = t;
  if (t) {
    localStorage.setItem('uc_token', t);
  } else {
    localStorage.removeItem('uc_token');
  }
}

/** Get the current token */
export function getToken() {
  return token;
}

/** Generic fetch wrapper that adds auth headers */
async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// Convenience methods
export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  patch: (path: string, body?: unknown) => request('PATCH', path, body),
  delete: (path: string) => request('DELETE', path),
};
