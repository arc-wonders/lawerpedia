export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString() || 'http://localhost:4000';

export const ADMIN_TOKEN_KEY = 'lawyerpedia_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

type ApiErrorPayload = { error?: string } | undefined;

export async function apiJson<T>(
  path: string,
  init: RequestInit & { admin?: boolean } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (init.admin) {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status === 204) return undefined as T;

  let payload: any = undefined;
  try {
    payload = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      (payload as ApiErrorPayload)?.error ||
      (payload as any)?.detail ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return payload as T;
}

export async function apiFetch(
  path: string,
  init: RequestInit & { admin?: boolean } = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);

  if (init.admin) {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let payload: any = undefined;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const msg = payload?.error || payload?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
