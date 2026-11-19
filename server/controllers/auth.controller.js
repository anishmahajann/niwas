import { toPublicUser } from '../services/auth.service.js';

export function getCurrentUser(req, res) {
  return res.json({ user: toPublicUser(req.user) });
}
