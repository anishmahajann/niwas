import { firebaseAdminAuth, isFirebaseAdminConfigured } from '../config/firebaseAdmin.js';
import { syncFirebaseUser } from '../services/auth.service.js';

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Sign in to continue.' });
  if (!isFirebaseAdminConfigured) {
    return res.status(503).json({ error: 'Firebase Admin is not configured on the server.' });
  }

  try {
    const claims = await firebaseAdminAuth.verifyIdToken(match[1], true);
    req.firebaseClaims = claims;
    req.user = await syncFirebaseUser(claims);
    return next();
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This email is already linked to another account.' });
    }
    if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
      return res.status(401).json({ error: 'Your Firebase session is invalid or expired. Sign in again.' });
    }
    return next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    return next();
  };
}

export const requireAdmin = requireRole('admin');
