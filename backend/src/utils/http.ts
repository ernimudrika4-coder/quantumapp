export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, meta: meta ?? null };
}

export function fail(message: string, code = 'APP_ERROR', details?: unknown) {
  return { success: false, error: { code, message, details: details ?? null } };
}
