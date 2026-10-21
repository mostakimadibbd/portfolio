import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates request bodies, query strings and params against a Zod schema.
 * The parsed (and coerced) value replaces the raw request input.
 *
 * @param {'body'|'query'|'params'} source
 * @param {import('zod').ZodTypeAny} schema
 */
export const validate = (source, schema) => (req, _res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
      code: issue.code,
    }));
    return next(ApiError.badRequest('Request validation failed', details));
  }

  if (source === 'query') req.validatedQuery = result.data;
  else req[source] = result.data;
  return next();
};

export const formatZodError = (error) =>
  error instanceof ZodError
    ? error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    : null;

export default validate;
