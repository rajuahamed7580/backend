import mongoose from 'mongoose';
import config from './index.js';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl);
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
