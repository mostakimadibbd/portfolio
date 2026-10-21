/**
 * Consistent JSON envelope for every API response.
 */
export const sendData = (res, data, { status = 200, meta } = {}) =>
  res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });

export const sendCreated = (res, data) => sendData(res, data, { status: 201 });

export const sendNoContent = (res) => res.status(204).end();

export default { sendData, sendCreated, sendNoContent };
