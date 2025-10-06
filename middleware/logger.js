/**
 * middleware/logger.js
 * Request + error logging middleware
 */

export function logger(req, _res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
}

export function errorHandler(err, _req, res, _next) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ❌ Error:`, err.message);
  res.status(500).json({ ok: false, error: err.message });
}
