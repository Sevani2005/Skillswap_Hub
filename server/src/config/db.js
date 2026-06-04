import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB using Mongoose.
 * Set USE_MEMORY_DB=true in .env to run without installing MongoDB on Windows.
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return;
  }
  let uri = process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      binary: { version: '5.0.26' },
    });
    uri = memoryServer.getUri('skillswap');
    console.log('Using embedded MongoDB (no system install required)');
    console.log('  Run "npm run seed" from the project root after the server starts');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: process.env.USE_MEMORY_DB === 'true' ? 15000 : 30000,
      family: 4,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (error.message?.includes('whitelist') || error.message?.includes('IP')) {
      console.error(
        'Atlas: add your IP at Network Access → Add IP Address (or 0.0.0.0/0 for dev only).'
      );
    } else if (!process.env.USE_MEMORY_DB) {
      console.error(
        'Tip: set USE_MEMORY_DB=true in server/.env to run without installing MongoDB locally.'
      );
    }
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
