import { environment } from '@/config/environment';
import type { ApiSuccess } from '@/types/api';

export class ApiRequestError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/* ─── Token persistence ─── */

const ACCESS_TOKEN_KEY = 'stadiumsphere-access-token';
const REFRESH_TOKEN_KEY = 'stadiumsphere-refresh-token';

function getAccessToken(): string | undefined {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return token === null || token.length === 0 ? undefined : token;
}

function getRefreshToken(): string | undefined {
  const token = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  return token === null || token.length === 0 ? undefined : token;
}

function persistTokens(tokens: AuthenticationTokens): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface AuthenticationTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER';
  sub: string;
}

/* ─── Core request helpers ─── */

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
      ? payload.message
      : `The platform request failed with status ${response.status}.`;
    throw new ApiRequestError(response.status, message);
  }

  return payload as T;
}

let refreshPromise: Promise<AuthenticationTokens> | null = null;

async function attemptTokenRefresh(): Promise<AuthenticationTokens> {
  if (refreshPromise !== null) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (refreshToken === undefined) {
    throw new ApiRequestError(401, 'No refresh token available.');
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${environment.VITE_API_BASE_URL}/auth/refresh`, {
        body: JSON.stringify({ refreshToken }),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload = await readResponse<ApiSuccess<AuthenticationTokens>>(response);
      persistTokens(payload.data);
      return payload.data;
    } catch {
      clearTokens();
      throw new ApiRequestError(401, 'Session expired. Please sign in again.');
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token !== undefined) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${environment.VITE_API_BASE_URL}${path}`, { ...init, headers });

  /* Transparent 401 retry: attempt token refresh once */
  if (response.status === 401 && token !== undefined) {
    try {
      await attemptTokenRefresh();
      const retryHeaders = new Headers(init.headers);
      retryHeaders.set('Accept', 'application/json');
      if (init.body !== undefined) retryHeaders.set('Content-Type', 'application/json');
      const freshToken = getAccessToken();
      if (freshToken !== undefined) retryHeaders.set('Authorization', `Bearer ${freshToken}`);
      const retryResponse = await fetch(`${environment.VITE_API_BASE_URL}${path}`, { ...init, headers: retryHeaders });
      const retryPayload = await readResponse<ApiSuccess<T>>(retryResponse);
      return retryPayload.data;
    } catch {
      /* Refresh failed — fall through to the original error */
    }
  }

  const payload = await readResponse<ApiSuccess<T>>(response);
  return payload.data;
}

/* ─── Resource API (unchanged contract) ─── */

export const resourceApi = {
  create<T, TInput>(path: string, input: TInput): Promise<T> {
    return apiRequest<T>(path, { body: JSON.stringify(input), method: 'POST' });
  },
  delete(path: string): Promise<void> {
    return apiRequest<void>(path, { method: 'DELETE' });
  },
  list<T>(path: string): Promise<readonly T[]> {
    return apiRequest<readonly T[]>(path);
  },
  update<T, TInput>(path: string, input: TInput): Promise<T> {
    return apiRequest<T>(path, { body: JSON.stringify(input), method: 'PUT' });
  },
  workflow<T>(path: string, input?: unknown): Promise<T> {
    return apiRequest<T>(path, input === undefined ? { method: 'POST' } : { body: JSON.stringify(input), method: 'POST' });
  },
};

/* ─── Authentication API ─── */

export const authenticationApi = {
  async login(email: string, password: string): Promise<AuthenticationTokens> {
    const tokens = await apiRequest<AuthenticationTokens>('/auth/login', {
      body: JSON.stringify({ email, password }),
      method: 'POST',
    });
    persistTokens(tokens);
    return tokens;
  },

  async register(email: string, password: string, role?: string): Promise<AuthenticationTokens> {
    const tokens = await apiRequest<AuthenticationTokens>('/auth/register', {
      body: JSON.stringify({ email, password, role }),
      method: 'POST',
    });
    persistTokens(tokens);
    return tokens;
  },

  async refresh(): Promise<AuthenticationTokens> {
    return attemptTokenRefresh();
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken !== undefined) {
      try {
        await apiRequest<void>('/auth/logout', {
          body: JSON.stringify({ refreshToken }),
          method: 'POST',
        });
      } catch {
        /* Best-effort logout */
      }
    }
    clearTokens();
  },

  async getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/me');
  },

  hasTokens(): boolean {
    return getAccessToken() !== undefined;
  },
};
