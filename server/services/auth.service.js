import User from '../models/User.js';

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function authError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function syncFirebaseUser(claims) {
  const firebaseUid = claims.uid;
  const email = claims.email?.trim().toLowerCase();
  if (!firebaseUid || !email) {
    throw authError('Your Firebase account must have an email address.', 401);
  }
  if (!claims.email_verified) {
    throw authError('Verify your email address before signing in.', 403);
  }

  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await User.findOne({ email });
    if (user?.firebaseUid && user.firebaseUid !== firebaseUid) {
      throw authError('This email is already linked to a different Firebase account.', 409);
    }
    if (!user) user = new User({ email, savedProperties: [] });
  }

  const nextRole = adminEmails.has(email) ? 'admin' : 'user';
  const nextName = claims.name?.trim() || email.split('@')[0];
  const nextPicture = claims.picture || undefined;
  const hasChanges = user.firebaseUid !== firebaseUid
    || user.email !== email
    || user.name !== nextName
    || user.picture !== nextPicture
    || user.role !== nextRole;

  user.firebaseUid = firebaseUid;
  user.email = email;
  user.name = nextName;
  user.picture = nextPicture;
  user.role = nextRole;
  if (hasChanges || user.isNew) await user.save();

  return user;
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}
