/**
 * Operational error with an HTTP-safe shape.
 * `details` is always safe to expose to clients.
 */
export class ApiError extends Error {
  constructor(statusCode, message, { code = 'ERROR', details = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Invalid request', details = null) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', details });
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message, { code: 'RATE_LIMITED' });
  }
}

export default ApiError;
