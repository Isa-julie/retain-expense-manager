// Run once:  npm run seed
// Creates the "Uncategorized" category, starter categories, and the first admin account.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { ensureDefaultCategory } from './models/Category.js';
import User from './models/User.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin account.');
}

await connectDB();
await ensureDefaultCategory();

const existing = await User.findOne({ email });

if (existing) {
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing user ${email} is now an admin.`);
  } else {
    console.log(`Admin ${email} already exists.`);
  }
} else {
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password,
    role: 'admin',
  });
  console.log(`Admin created: ${email}`);
}

await mongoose.disconnect();
