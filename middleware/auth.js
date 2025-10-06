// /middleware/auth.js
// ==================================================
// 🧩 Role-Based Authorization Middleware
// --------------------------------------------------
// Provides reusable middlewares for authentication
// and authorization. Compatible with session or JWT
// populated user objects (req.user = { id, email, role }).
// ==================================================

/**
 * Ensures the user is authenticated.
 * Responds with 401 if not logged in.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized – login required',
    });
  }
  next();
}

/**
 * Restricts access to a specific role.
 * @param {string} role - e.g. 'admin', 'landlord', 'tenant'
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized – login required',
      });
    }
    if (req.user.role !== role) {
      console.warn(`[auth] Access denied: expected role=${role}, got=${req.user.role}`);
      return res.status(403).json({
        success: false,
        error: `Forbidden – requires role: ${role}`,
      });
    }
    next();
  };
}

/**
 * Allows access to any of the listed roles.
 * @param {string[]} roles - e.g. ['admin', 'landlord']
 */
export function requireAnyRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized – login required',
      });
    }
    if (!roles.includes(req.user.role)) {
      console.warn(`[auth] Access denied: allowed=[${roles.join(',')}], got=${req.user.role}`);
      return res.status(403).json({
        success: false,
        error: `Forbidden – requires one of: ${roles.join(', ')}`,
      });
    }
    next();
  };
}

/**
 * Optional helper to expose auth status for /api/health
 */
export function getAuthStatus() {
  return {
    enabled: true,
    roles: ['admin', 'landlord', 'tenant'],
  };
}

// ==================================================
// ✅ Usage Example
// import { requireAuth, requireRole, requireAnyRole } from '../middleware/auth.js';
// app.get('/api/users/list', requireRole('admin'), handler);
// app.post('/api/properties/add', requireAnyRole(['landlord','admin']), handler);
// ==================================================
