import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  status: { type: String, default: 'Active' },
  phno: String
});

const User = mongoose.model('User', userSchema);

async function create() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Atlas');

  const email = 'r@gmail.com';
  const plainPassword = 'reception@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Check if exists
  const existing = await User.findOne({ email: /r@gmail.com/i });
  if (existing) {
      console.log('User already exists, updating password and role...');
      existing.password = hashedPassword;
      existing.role = 'receptionist';
      existing.status = 'Active';
      await existing.save();
  } else {
      console.log('Creating new receptionist user...');
      const user = new User({
          name: 'Default Receptionist',
          email: email,
          password: hashedPassword,
          role: 'receptionist',
          status: 'Active',
          phno: '1234567890'
      });
      await user.save();
  }

  console.log('Verification:');
  const check = await User.findOne({ email: /r@gmail.com/i });
  console.log('Final User in DB:', JSON.stringify({ email: check.email, role: check.role, status: check.status }, null, 2));

  await mongoose.disconnect();
}

create().catch(console.error);
