/**
 * Tiny fetch wrapper with a timeout, JSON parsing and normalised errors.
 */

const DEFAULT_TIMEOUT = 8000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const request = async (path, { method = 'GET', body, timeout = DEFAULT_TIMEOUT, signal } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), timeout);

  if (signal) signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });

  try {
    const response = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: 'same-origin',
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error = payload?.error ?? {};
      throw new ApiError(error.message || `Request failed with status ${response.status}`, {
        status: response.status,
        code: error.code || 'HTTP_ERROR',
        details: error.details ?? null,
      });
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new ApiError('The request timed out. Please check your connection and try again.', {
        code: 'TIMEOUT',
      });
    }
    throw new ApiError('Could not reach the server. Please try again in a moment.', { code: 'NETWORK_ERROR' });
  } finally {
    clearTimeout(timer);
  }
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
};

export default api;
