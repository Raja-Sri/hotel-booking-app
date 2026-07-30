import { Request, Response } from 'express';

export const SPRING_BASE = process.env.SPRING_API_URL || 'http://localhost:8080';

export interface SpringApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export function getAuthHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authorization = req.headers['authorization'];
  if (authorization) {
    headers['Authorization'] = String(authorization);
  }
  return headers;
}

export async function proxyToSpring(
  req: Request,
  res: Response,
  springPath: string,
  options?: { method?: string; body?: unknown }
): Promise<void> {
  const method = options?.method || req.method;
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `${SPRING_BASE}${springPath}${query}`;

  const fetchOptions: RequestInit = {
    method,
    headers: getAuthHeaders(req),
  };

  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  } else if (method !== 'GET' && method !== 'DELETE' && req.body && Object.keys(req.body).length > 0) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const springRes = await fetch(url, fetchOptions);
  const text = await springRes.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { success: false, message: text };
  }

  res.status(springRes.status).json(body);
}

export function unwrapData<T>(body: SpringApiResponse<T> | T | null): T | null {
  if (body == null) return null;
  if (typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as SpringApiResponse<T>).data ?? null;
  }
  return body as T;
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
