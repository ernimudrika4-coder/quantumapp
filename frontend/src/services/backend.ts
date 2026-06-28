import type { GeneratedSignal } from '../context/AppContext';
import type { EconomicEvent } from './news';
import type { LiveData } from './twelvedata';

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL || '/api';
const TOKEN_KEY = 'quantum_auth_token';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown> | null;
  error?: { message?: string };
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string, authenticated = false): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: authenticated ? authHeaders() : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as ApiEnvelope<T>;
    if (!json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

async function apiPost<T>(path: string, payload: unknown, authenticated = false): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated ? authHeaders() : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as ApiEnvelope<T>;
    if (!json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

async function apiDelete<T>(path: string, authenticated = false): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authenticated ? authHeaders() : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as ApiEnvelope<T>;
    if (!json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function backendRegister(payload: { name: string; email: string; password: string }) {
  return apiPost<{ user: any; token: string }>('/auth/register', payload);
}

export async function backendLogin(payload: { email: string; password: string }) {
  return apiPost<{ user: any; token: string }>('/auth/login', payload);
}

export async function backendGetMe() {
  return apiGet<any>('/users/me', true);
}

export async function backendGetWatchlist() {
  return apiGet<string[]>('/watchlist', true);
}

export async function backendAddWatchlist(symbol: string) {
  return apiPost('/watchlist', { symbol }, true);
}

export async function backendRemoveWatchlist(symbol: string) {
  return apiDelete(`/watchlist/${encodeURIComponent(symbol)}`, true);
}

export async function backendGetNotifications() {
  return apiGet<any[]>('/notifications', true);
}

export async function backendMarkNotificationRead(id: string) {
  return apiPost(`/notifications/${encodeURIComponent(id)}/read`, {}, true);
}

export async function backendMarkAllNotificationsRead() {
  return apiPost('/notifications/read-all', {}, true);
}

export async function fetchBackendQuotes(): Promise<LiveData[] | null> {
  return apiGet<LiveData[]>('/markets/quotes');
}

export async function fetchBackendMarketDetail(symbol: string): Promise<any | null> {
  return apiGet<any>(`/markets/detail/${encodeURIComponent(symbol)}`);
}

export async function fetchBackendEvents(): Promise<EconomicEvent[] | null> {
  return apiGet<EconomicEvent[]>('/events/upcoming');
}

export async function fetchBackendSignals(): Promise<GeneratedSignal[] | null> {
  return apiGet<GeneratedSignal[]>('/signals/live');
}

export async function fetchBackendGeneratedSignal(symbol: string): Promise<any | null> {
  return apiGet<any>(`/signals/generated/${encodeURIComponent(symbol)}`);
}

export async function fetchBackendSignalHistory(): Promise<any[] | null> {
  return apiGet<any[]>('/signals/history', true);
}

export async function fetchBackendSignalPerformance(): Promise<Record<string, unknown> | null> {
  return apiGet<Record<string, unknown>>('/signals/performance', true);
}

export async function postBackendFollowSignal(payload: {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
}) {
  return apiPost('/signals/follow', payload, true);
}

export async function backendGetPushPublicKey() {
  return apiGet<{ publicKey: string }>('/notifications/public-key');
}

export async function postBackendPushSubscription(payload: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  platform?: string;
}) {
  return apiPost('/notifications/subscribe', payload, true);
}

export async function backendSendTestNotification() {
  return apiPost('/notifications/test', {}, true);
}
