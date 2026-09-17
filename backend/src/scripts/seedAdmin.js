import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: resolve(__dirname, '../../.env') });

import Profile from '../models/Profile.js';

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@pravixo.com';
    const adminPassword = 'AdminPassword123!';

    const existingAdmin = await Profile.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists. Password might be different if it was changed.');
      console.log('Email:', adminEmail);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userId = `user_${Buffer.from(adminEmail).toString('base64').replace(/=/g, '')}`;

    const adminProfile = await Profile.create({
      userId,
      fullName: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      verificationStatus: 'verified'
    });

    // console.log('Admin created successfully:');
    // console.log('Email:', adminEmail);
    // console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
