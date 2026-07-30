const TOKEN_KEY = 'stayvibe_token';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const json = await response.json().catch(() => null);

  if (json && typeof json === 'object' && 'success' in json) {
    const envelope = json as ApiEnvelope<T>;
    if (!response.ok || envelope.success === false) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: envelope.message || 'Request failed',
      };
    }
    return { ok: true, status: response.status, data: (envelope.data ?? null) as T };
  }

  if (!response.ok) {
    const err = json as { message?: string; error?: string } | null;
    return {
      ok: false,
      status: response.status,
      data: null,
      error: err?.message || err?.error || 'Request failed',
    };
  }

  return { ok: true, status: response.status, data: json as T };
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
