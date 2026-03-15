import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String,
  status: String,
});

const User = mongoose.model('User', userSchema);

async function test() {
  console.log('Connecting to MONGO_URI from .env...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected Successfully');

  const users = await User.find({ role: 'receptionist' });
  console.log('Receptionists found:', users.map(u => ({ id: u._id, email: u.email, status: u.status })));

  const email = 'r@gmail.com';
  const pass = 'reception@123';
  const role = 'receptionist';

  const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      role: { $regex: new RegExp(`^${role}$`, 'i') }
  });

  const testEmail = `reception_test_${Date.now()}@test.com`;
  const testPass = 'reception@123';
  
  console.log(`\nCreating fresh test user: ${testEmail}`);
  const hashed = await bcrypt.hash(testPass, 10);
  const newUser = new User({
    email: testEmail,
    password: hashed,
    role: 'receptionist',
    status: 'Active'
  });
  await newUser.save();
  console.log('Test user saved.');

  const fetchedUser = await User.findOne({ email: testEmail });
  const isMatchNew = await bcrypt.compare(testPass, fetchedUser.password);
  console.log(`Verification of fresh user login: ${isMatchNew ? 'SUCCESS' : 'FAILED'}`);

  if (isMatchNew) {
      console.log('Rounding check:');
      const matchWith10 = await bcrypt.compare(testPass, fetchedUser.password);
      console.log('Compare again:', matchWith10);
  }

  // Cleanup
  await User.deleteOne({ email: testEmail });
  console.log('Test user cleaned up.');

  await mongoose.disconnect();
}

test().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
