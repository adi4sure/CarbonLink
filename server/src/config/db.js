import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Connect to MongoDB if MONGO_URI is set, otherwise fall back to JSON file DB.
 * This makes the app work out-of-the-box without MongoDB for development,
 * while supporting a full MongoDB deployment in production.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database: ${conn.connection.name}`);
      return { type: 'mongodb' };
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log('⚠️  Falling back to JSON file database...\n');
    }
  }

  // Fallback: JSON file database
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    console.log(`✅ JSON Database ready at ${DATA_DIR}`);
    return { type: 'json' };
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
