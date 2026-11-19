import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import { requireAdmin, requireAuth } from './middleware/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import { isFirebaseAdminConfigured } from './config/firebaseAdmin.js';
import { Property, Report, VerificationHistory } from './models.js';
import User from './models/User.js';
import { calculateTrustScore } from '../src/utils/trustScore.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(currentDir, '..', 'uploads'));
const imageRoot = path.join(uploadRoot, 'images');
const documentRoot = path.join(uploadRoot, 'documents');
fs.mkdirSync(imageRoot, { recursive: true });
fs.mkdirSync(documentRoot, { recursive: true });

const app = express();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const validVerificationKeys = new Set([
  'propertyExists', 'locationVerified', 'availabilityVerified', 'ownerVerified', 'photosVerified',
]);
const validStatuses = new Set(['verified', 'pending', 'failed', 'expired']);
const reportReasons = new Set([
  'Property unavailable', 'Incorrect price', 'Incorrect property type', 'Wrong location',
  'Misleading photos', 'Property does not exist', 'Suspicious lister', 'Other',
]);
const withPropertyId = (property) => ({ ...property, id: property._id });
const toPublicProperty = (property) => {
  const result = withPropertyId(property);
  const owner = { ...result.owner };
  delete owner.email;
  if (owner.phone) {
    owner.phone = `${owner.phone.slice(0, 4)}••••${owner.phone.slice(-2)}`;
  }
  result.owner = owner;
  delete result.ownerUserId;
  delete result.reports;
  if (result.verification?.documentsReviewed?.items) {
    result.verification.documentsReviewed.items = result.verification.documentsReviewed.items.map((document, index) => ({
      name: `Document ${index + 1}`,
      status: document.status,
    }));
  }
  return result;
};
const optionalNumber = (value) => (
  value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : undefined
);

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));

const imageStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, imageRoot),
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const documentStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, documentRoot),
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Images must be JPG, PNG, or WebP.'));
    }
    return callback(null, true);
  },
});
const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 15 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Documents must be PDF, JPG, PNG, or WebP.'));
    }
    return callback(null, true);
  },
});

app.use('/uploads/images', express.static(imageRoot, {
  fallthrough: false,
  immutable: true,
  maxAge: '1d',
  dotfiles: 'deny',
}));

app.get('/api/health', (_req, res) => {
  const databaseConnected = Property.db.readyState === 1;
  const ready = databaseConnected && isFirebaseAdminConfigured;
  res.status(databaseConnected ? 200 : 503).json({
    status: ready ? 'ok' : 'configuration_required',
    database: Property.db.readyState === 1 ? 'connected' : 'disconnected',
    authenticationConfigured: isFirebaseAdminConfigured,
    requiredConfiguration: [
      ...(!process.env.MONGODB_URI ? ['MONGODB_URI'] : []),
      ...(!isFirebaseAdminConfigured ? ['FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS'] : []),
    ],
  });
});

app.use('/api/auth', authRoutes);

function buildPropertyFilter(query) {
  const filter = { status: 'published' };
  if (query.city) filter.city = new RegExp(`^${escapeRegex(query.city.trim())}$`, 'i');
  if (query.listingType && ['buy', 'rent', 'commercial'].includes(query.listingType)) {
    filter.listingType = query.listingType;
  }
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.bedrooms && Number.isFinite(Number(query.bedrooms))) filter.bedrooms = Number(query.bedrooms);
  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter.price = {};
    if (Number.isFinite(minPrice) && query.minPrice !== '') filter.price.$gte = minPrice;
    if (Number.isFinite(maxPrice) && query.maxPrice !== '') filter.price.$lte = maxPrice;
  }
  if (query.verifiedOnly === 'true') filter['trustScore.total'] = { $gte: 70 };
  if (query.ownerVerified === 'true') filter['verification.ownerVerified.status'] = 'verified';
  if (query.documentsChecked === 'true') filter['verification.documentsReviewed.checked'] = { $gt: 0 };
  if (query.availableToday === 'true') {
    filter.availabilityStatus = 'available';
    filter['verification.availabilityVerified.date'] = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  }
  if (query.search?.trim()) {
    const term = new RegExp(escapeRegex(query.search.trim().slice(0, 100)), 'i');
    filter.$or = [{ city: term }, { locality: term }, { title: term }];
  }
  return filter;
}

app.get('/api/properties', asyncRoute(async (req, res) => {
  const page = Math.max(1, Math.min(Number(req.query.page) || 1, 1000));
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 100, 100));
  const sortOptions = {
    newest: { lastVerifiedAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'trust-score': { 'trustScore.total': -1 },
    relevance: { 'trustScore.total': -1 },
  };
  const sort = sortOptions[req.query.sort] || sortOptions.relevance;
  const filter = buildPropertyFilter(req.query);
  const [items, total] = await Promise.all([
    Property.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);
  res.json({ items: items.map(toPublicProperty), page, limit, total });
}));

app.get('/api/properties/:id', asyncRoute(async (req, res) => {
  const property = await Property.findById(req.params.id).lean();
  if (!property || property.status !== 'published') return res.status(404).json({ error: 'Property not found.' });
  res.json({ property: toPublicProperty(property) });
}));

app.post('/api/properties', requireAuth, asyncRoute(async (req, res) => {
  const payload = req.body || {};
  const requiredText = ['title', 'city', 'locality', 'propertyType'];
  if (requiredText.some((key) => typeof payload[key] !== 'string' || !payload[key].trim())) {
    return res.status(400).json({ error: 'Title, city, locality, and property type are required.' });
  }
  if (!Number.isFinite(Number(payload.price)) || Number(payload.price) <= 0) {
    return res.status(400).json({ error: 'Enter a valid property price.' });
  }
  const listingType = String(payload.listingType || '').toLowerCase();
  if (!['buy', 'rent', 'commercial'].includes(listingType)) {
    return res.status(400).json({ error: 'Choose a valid listing type.' });
  }
  const ownerType = payload.ownerType === 'Broker' ? 'Broker' : 'Owner';
  const uploadedDocs = Array.isArray(payload.documents) ? payload.documents.slice(0, 8) : [];
  const property = new Property({
    _id: `listing-${crypto.randomUUID()}`,
    title: payload.title.trim(),
    price: Number(payload.price),
    city: payload.city.trim(),
    locality: payload.locality.trim(),
    address: typeof payload.address === 'string' ? payload.address.slice(0, 500) : '',
    latitude: optionalNumber(payload.latitude),
    longitude: optionalNumber(payload.longitude),
    propertyType: payload.propertyType.trim(),
    listingType,
    bedrooms: optionalNumber(payload.bedrooms),
    bathrooms: optionalNumber(payload.bathrooms),
    area: optionalNumber(payload.area),
    description: typeof payload.description === 'string' ? payload.description.slice(0, 5000) : '',
    amenities: Array.isArray(payload.amenities) ? payload.amenities.filter((item) => typeof item === 'string').slice(0, 40) : [],
    images: Array.isArray(payload.images) ? payload.images.filter((url) => typeof url === 'string' && url.startsWith('/uploads/images/')).slice(0, 12) : [],
    owner: {
      name: req.user.name,
      email: req.user.email,
      phone: typeof payload.ownerPhone === 'string' ? payload.ownerPhone.slice(0, 30) : '',
      type: ownerType,
    },
    ownerUserId: req.user._id,
    verification: {
      propertyExists: { status: 'pending' },
      locationVerified: { status: 'pending' },
      availabilityVerified: { status: 'pending' },
      ownerVerified: { status: 'pending' },
      photosVerified: { status: 'pending' },
      documentsReviewed: {
        total: uploadedDocs.length,
        checked: 0,
        items: uploadedDocs.map((doc) => ({
          name: String(doc.name || 'Property Document').slice(0, 120),
          status: 'pending',
          url: typeof doc.url === 'string' && doc.url.startsWith('/api/uploads/documents/') ? doc.url : undefined,
        })),
      },
    },
    availabilityStatus: 'pending',
    status: 'pending',
    createdAt: new Date(),
    verificationHistory: [{ date: new Date(), event: 'Listing submitted', detail: 'Property submitted and is awaiting verification.' }],
  });
  property.trustScore = calculateTrustScore(property.verification, property.createdAt);
  await property.save();
  res.status(201).json({ property: withPropertyId(property.toObject()) });
}));

app.get('/api/users/me/saved', requireAuth, asyncRoute(async (req, res) => {
  const ids = req.user.savedProperties.map((saved) => saved.propertyId);
  const properties = await Property.find({ _id: { $in: ids }, status: 'published' }).lean();
  const savedById = new Map(req.user.savedProperties.map((saved) => [saved.propertyId, saved]));
  res.json({
    items: properties.map((property) => ({
      ...toPublicProperty(property),
      savedAt: savedById.get(property._id)?.savedAt,
      note: savedById.get(property._id)?.note || '',
    })),
  });
}));

app.put('/api/users/me/saved/:id', requireAuth, asyncRoute(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'published' }).select('_id').lean();
  if (!property) return res.status(404).json({ error: 'Property not found.' });
  const saved = req.user.savedProperties.find((item) => item.propertyId === property._id);
  if (!saved) req.user.savedProperties.push({ propertyId: property._id });
  await req.user.save();
  res.json({ saved: true });
}));

app.delete('/api/users/me/saved/:id', requireAuth, asyncRoute(async (req, res) => {
  req.user.savedProperties = req.user.savedProperties.filter((saved) => saved.propertyId !== req.params.id);
  await req.user.save();
  res.status(204).end();
}));

app.put('/api/users/me/saved/:id/note', requireAuth, asyncRoute(async (req, res) => {
  if (typeof req.body?.note !== 'string' || req.body.note.length > 2000) {
    return res.status(400).json({ error: 'Notes must be text no longer than 2,000 characters.' });
  }
  const saved = req.user.savedProperties.find((item) => item.propertyId === req.params.id);
  if (!saved) return res.status(404).json({ error: 'Save this property before adding a note.' });
  saved.note = req.body.note;
  await req.user.save();
  res.json({ note: saved.note });
}));

app.post('/api/properties/:id/reports', requireAuth, rateLimit({ windowMs: 60 * 60 * 1000, limit: 20 }), asyncRoute(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, status: 'published' }).select('_id title').lean();
  if (!property) return res.status(404).json({ error: 'Property not found.' });
  const { reason, details = '' } = req.body || {};
  if (!reportReasons.has(reason) || typeof details !== 'string' || details.length > 2000) {
    return res.status(400).json({ error: 'Choose a valid report reason and keep details under 2,000 characters.' });
  }
  const report = await Report.create({
    propertyId: property._id,
    propertyTitle: property.title,
    reporterId: req.user._id,
    reporterName: req.user.name,
    reason,
    details,
  });
  res.status(201).json({ report });
}));

app.get('/api/admin/dashboard', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [totalListings, verifiedListings, pendingListings, reportedListings, expiredVerification, suspiciousListings, avgScore] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ 'trustScore.total': { $gte: 70 }, status: 'published' }),
    Property.countDocuments({ status: 'pending' }),
    Report.distinct('propertyId', { status: { $nin: ['dismissed'] } }).then((items) => items.length),
    Property.countDocuments({ lastVerifiedAt: { $lt: new Date(Date.now() - 14 * 86400000) } }),
    Property.countDocuments({ 'trustScore.total': { $lt: 30 }, status: 'published' }),
    Property.aggregate([{ $group: { _id: null, value: { $avg: '$trustScore.total' } } }]),
  ]);
  res.json({
    totalListings, verifiedListings, pendingListings, reportedListings, expiredVerification,
    suspiciousListings, averageTrustScore: Math.round(avgScore[0]?.value || 0),
  });
}));

app.get('/api/admin/properties', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.status && ['pending', 'published', 'rejected', 'archived'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim().slice(0, 100)), 'i');
    filter.$or = [{ title: search }, { city: search }, { 'owner.name': search }];
  }
  const items = await Property.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ items: items.map(withPropertyId) });
}));

app.patch('/api/admin/properties/:id/verification', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { check, status, notes } = req.body || {};
  if (!validVerificationKeys.has(check) || !validStatuses.has(status)) {
    return res.status(400).json({ error: 'Choose a supported verification check and status.' });
  }
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found.' });
  property.verification[check].status = status;
  property.verification[check].date = new Date();
  property.verification[check].verifier = req.user.name;
  if (typeof notes === 'string') property.verification[check].notes = notes.slice(0, 1000);
  property.trustScore = calculateTrustScore(property.verification, property.createdAt);
  property.lastVerifiedAt = new Date();
  property.verificationHistory.push({
    date: new Date(),
    event: `${check} ${status}`,
    detail: typeof notes === 'string' ? notes.slice(0, 1000) : `Status set to ${status}.`,
    status,
    verifier: req.user.name,
  });
  await property.save();
  await VerificationHistory.create({
    propertyId: property.id, propertyTitle: property.title, event: `${check} ${status}`,
    detail: typeof notes === 'string' ? notes.slice(0, 1000) : `Status set to ${status}.`,
    status, verifierId: req.user._id, verifierName: req.user.name,
  });
  res.json({ property: withPropertyId(property.toObject()) });
}));

app.patch('/api/admin/properties/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { status } = req.body || {};
  if (!['published', 'rejected', 'archived', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Choose a valid listing status.' });
  }
  const property = await Property.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after', runValidators: true });
  if (!property) return res.status(404).json({ error: 'Property not found.' });
  await VerificationHistory.create({
    propertyId: property.id,
    propertyTitle: property.title,
    event: `Listing ${status}`,
    detail: `Administrator changed listing status to ${status}.`,
    status,
    verifierId: req.user._id,
    verifierName: req.user.name,
  });
  res.json({ property: withPropertyId(property.toObject()) });
}));

app.get('/api/admin/documents', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const properties = await Property.find({ 'verification.documentsReviewed.items.0': { $exists: true } })
    .select('_id title owner verification.documentsReviewed.items')
    .lean();
  const items = properties.flatMap((property) => property.verification.documentsReviewed.items.map((document, index) => ({
    id: `${property._id}:${index}`,
    propertyId: property._id,
    propertyTitle: property.title,
    ownerName: property.owner?.name,
    name: document.name,
    status: document.status,
    uploadedAt: document.date,
    url: document.url,
  })));
  res.json({ items });
}));

app.patch('/api/admin/documents/:propertyId/:index', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const index = Number(req.params.index);
  const { status } = req.body || {};
  if (!Number.isInteger(index) || index < 0 || !['reviewed', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Choose a valid document review status.' });
  }
  const property = await Property.findById(req.params.propertyId);
  const document = property?.verification.documentsReviewed.items[index];
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  document.status = status;
  document.date = new Date();
  property.verification.documentsReviewed.checked = property.verification.documentsReviewed.items
    .filter((item) => ['reviewed', 'verified'].includes(item.status)).length;
  property.trustScore = calculateTrustScore(property.verification, property.createdAt);
  property.verificationHistory.push({
    date: new Date(), event: `Document ${status}`, detail: `${document.name} marked ${status}.`, status, verifier: req.user.name,
  });
  await property.save();
  await VerificationHistory.create({
    propertyId: property.id, propertyTitle: property.title, event: `Document ${status}`,
    detail: `${document.name} marked ${status}.`, status, verifierId: req.user._id, verifierName: req.user.name,
  });
  res.json({ property });
}));

app.get('/api/admin/reports', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const items = await Report.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ items: items.map((item) => ({ ...item, id: item._id })) });
}));

app.patch('/api/admin/reports/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { status } = req.body || {};
  if (!['pending', 'investigating', 'confirmed', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Choose a valid report status.' });
  }
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, reviewedBy: req.user._id, reviewedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  );
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  if (status === 'confirmed') {
    await Property.updateOne({ _id: report.propertyId }, { $set: { availabilityStatus: 'reported' } });
  }
  res.json({ report: { ...report.toObject(), id: report.id } });
}));

app.get('/api/admin/users', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ items: users.map((user) => ({
    id: user._id.toString(), name: user.name, email: user.email, picture: user.picture,
    phone: user.phone, role: user.role, verified: Boolean(user.googleId), joinedDate: user.createdAt,
    listingCount: 0, trustScore: 0,
  })) });
}));

app.get('/api/admin/history', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const items = await VerificationHistory.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ items: items.map((item) => ({ ...item, id: item._id, date: item.createdAt })) });
}));

app.post('/api/uploads/images', requireAuth, imageUpload.array('files', 12), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Select at least one image to upload.' });
  return res.status(201).json({
    files: req.files.map((file) => ({ name: file.originalname, url: `/uploads/images/${file.filename}` })),
  });
});

app.post('/api/uploads/documents', requireAuth, documentUpload.array('files', 8), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Select at least one document to upload.' });
  return res.status(201).json({
    files: req.files.map((file) => ({ name: file.originalname, url: `/api/uploads/documents/${file.filename}` })),
  });
});

app.get('/api/uploads/documents/:filename', requireAuth, asyncRoute(async (req, res) => {
  const filename = path.basename(req.params.filename);
  if (filename !== req.params.filename) return res.status(400).json({ error: 'Invalid document path.' });
  const filePath = path.join(documentRoot, filename);
  const property = await Property.findOne({
    $or: [{ ownerUserId: req.user._id }, ...(req.user.role === 'admin' ? [{}] : [])],
    'verification.documentsReviewed.items.url': `/api/uploads/documents/${filename}`,
  }).select('_id').lean();
  if (!property) return res.status(404).json({ error: 'Document not found.' });
  return res.sendFile(filePath);
}));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'The file exceeds the upload size limit.' : error.message });
  }
  if (error.status === 404 && error.path?.startsWith('/uploads/images/')) {
    return res.status(404).json({ error: 'Image not found.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ error: error.message });
  }
  if (error.code === 11000) return res.status(409).json({ error: 'This account already exists.' });
  if (error.message?.includes('must be JPG') || error.message?.includes('must be PDF')) {
    return res.status(400).json({ error: error.message });
  }
  if (error.message?.includes('ECONNREFUSED') || error.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ error: 'MongoDB is unavailable. Check MONGODB_URI and database access.' });
  }
  console.error('API request failed:', error);
  return res.status(500).json({ error: 'The server could not complete this request.' });
});

export default app;
