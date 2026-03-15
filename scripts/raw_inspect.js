import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function rawInspect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  const hmsDb = mongoose.connection.useDb('hospital_backend');
  const collections = await hmsDb.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const users = await hmsDb.db.collection('users').find({ email: /r@gmail.com/i }).toArray();
  console.log('Found users:', users.length);

  for (const u of users) {
      console.log('RAW USER DATA:', JSON.stringify(u, null, 2));
      const isMatch = await bcrypt.compare('reception@123', u.password || '');
      console.log('Password "reception@123" match:', isMatch);
  }

  await mongoose.disconnect();
}

rawInspect().catch(console.error);
