import mongoose from 'mongoose';
import User from '../models/User.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth-system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Automatically seed an Admin user securely from .env variables
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!adminExists) {
        await User.create({
          name: 'Super Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
          isVerified: true
        });
        console.log('Secure Admin user automatically seeded to database.');
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
