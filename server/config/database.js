import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI must be configured before starting the API.');
  await mongoose.connect(uri);
  console.info('Connected to MongoDB');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
