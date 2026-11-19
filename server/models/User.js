import mongoose from 'mongoose';

const { Schema } = mongoose;

const savedPropertySchema = new Schema({
  propertyId: { type: String, ref: 'Property', required: true },
  note: { type: String, maxlength: 2000, default: '' },
  savedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new Schema({
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  googleId: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  picture: String,
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedProperties: { type: [savedPropertySchema], default: [] },
}, { timestamps: true, versionKey: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
