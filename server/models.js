import mongoose from 'mongoose';

const { Schema } = mongoose;

const verificationCheckSchema = new Schema({
  status: { type: String, enum: ['verified', 'reviewed', 'pending', 'failed', 'expired', 'not_provided'], default: 'pending' },
  date: { type: Date, default: null },
  verifier: String,
  method: String,
  confirmedBy: String,
  capturedBy: String,
  count: Number,
  notes: String,
}, { _id: false, strict: false });

const documentItemSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['reviewed', 'verified', 'pending', 'failed', 'not_provided', 'rejected'], default: 'pending' },
  date: { type: Date, default: null },
  url: String,
}, { _id: false });

const propertySchema = new Schema({
  _id: { type: String },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  price: { type: Number, required: true, min: 1 },
  city: { type: String, required: true, trim: true, maxlength: 80, index: true },
  locality: { type: String, required: true, trim: true, maxlength: 120 },
  address: { type: String, trim: true, maxlength: 500 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  propertyType: { type: String, required: true, maxlength: 80 },
  listingType: { type: String, enum: ['buy', 'rent', 'commercial'], required: true, index: true },
  bedrooms: { type: Number, min: 0, max: 100 },
  bathrooms: { type: Number, min: 0, max: 100 },
  area: { type: Number, min: 0 },
  floor: Schema.Types.Mixed,
  totalFloors: Number,
  facing: String,
  age: String,
  furnishing: String,
  description: { type: String, maxlength: 5000 },
  amenities: [String],
  images: [String],
  owner: {
    name: { type: String, required: true },
    verified: { type: Boolean, default: false },
    type: { type: String, default: 'Owner' },
    phone: String,
    email: String,
    joinedDate: String,
    listingCount: { type: Number, default: 1 },
    responseRate: Number,
  },
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  verification: {
    propertyExists: { type: verificationCheckSchema, default: () => ({}) },
    locationVerified: { type: verificationCheckSchema, default: () => ({}) },
    availabilityVerified: { type: verificationCheckSchema, default: () => ({}) },
    ownerVerified: { type: verificationCheckSchema, default: () => ({}) },
    photosVerified: { type: verificationCheckSchema, default: () => ({}) },
    documentsReviewed: {
      checked: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      items: { type: [documentItemSchema], default: [] },
    },
  },
  trustScore: {
    total: { type: Number, default: 0 },
    breakdown: { type: Schema.Types.Mixed, default: {} },
  },
  verificationHistory: [{
    date: Date,
    event: String,
    detail: String,
    status: String,
    verifier: String,
  }],
  reports: [Schema.Types.Mixed],
  lastVerifiedAt: Date,
  availabilityStatus: { type: String, enum: ['available', 'pending', 'reported', 'unknown', 'unavailable'], default: 'pending', index: true },
  status: { type: String, enum: ['pending', 'published', 'rejected', 'archived'], default: 'published', index: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

propertySchema.index({ city: 1, listingType: 1, status: 1 });
propertySchema.index({ price: 1, bedrooms: 1, propertyType: 1 });

const reportSchema = new Schema({
  propertyId: { type: String, required: true, index: true },
  propertyTitle: String,
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reporterName: String,
  reason: { type: String, required: true, maxlength: 120 },
  details: { type: String, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'investigating', 'confirmed', 'dismissed'], default: 'pending', index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true, versionKey: false });

const historySchema = new Schema({
  propertyId: { type: String, index: true },
  propertyTitle: String,
  event: { type: String, required: true },
  detail: String,
  status: String,
  verifierId: { type: Schema.Types.ObjectId, ref: 'User' },
  verifierName: String,
}, { timestamps: true, versionKey: false });

export const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export const VerificationHistory = mongoose.models.VerificationHistory
  || mongoose.model('VerificationHistory', historySchema);
