import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import app from './app.js';

const port = Number(process.env.PORT) || 4000;
const mongoUri = process.env.MONGODB_URI
  || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/niwas');

await connectDatabase(mongoUri);
const server = app.listen(port, () => {
  console.info(`Niwas API listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  });
}
