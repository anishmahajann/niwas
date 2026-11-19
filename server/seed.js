import 'dotenv/config';
import mongoose from 'mongoose';
import properties from '../src/data/properties.js';
import { Property } from './models.js';
import { calculateTrustScore } from '../src/utils/trustScore.js';

process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/niwas';

await mongoose.connect(process.env.MONGODB_URI);

for (const item of properties) {
  const property = {
    ...item,
    _id: item.id,
    id: undefined,
    status: 'published',
    createdAt: new Date(item.createdAt),
    lastVerifiedAt: item.lastVerifiedAt ? new Date(item.lastVerifiedAt) : undefined,
    trustScore: calculateTrustScore(item.verification, item.createdAt),
  };
  await Property.findByIdAndUpdate(item.id, property, {
    upsert: true,
    returnDocument: 'after',
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  console.info(`Seeded ${item.id}`);
}

console.info(`Seeded ${properties.length} sample listings.`);
await mongoose.disconnect();
