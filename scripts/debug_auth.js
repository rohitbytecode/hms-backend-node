import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String,
  status: String,
});

const User = mongoose.model('User', userSchema);

async function debug() {
  const uris = [
    'mongodb://mongo:27017/hospital_backend',
    'mongodb://localhost:27018/hospital_backend',
    process.env.MONGO_URI
  ];

  let connected = false;
  for (const uri of uris) {
    try {
      if (!uri) continue;
      console.log(`Trying to connect to: ${uri}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      connected = true;
      console.log('Connected Successfully');
      break;
    } catch (err) {
      console.warn(`Connection to ${uri} failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('COULD NOT CONNECT TO ANY DATABASE');
    process.exit(1);
  }

  const admin = mongoose.connection.useDb('admin').db.admin();
  const dbs = await admin.listDatabases();
  console.log('Available databases:', dbs.databases.map(d => d.name));

  const email = 'r@gmail.com';
  const role = 'receptionist';
  const plainPassword = 'reception@123';

  console.log(`Searching for user: ${email} in ALL databases...`);
  
  for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.useDb(dbInfo.name);
      const UserInDb = db.model('User', userSchema);
      const user = await UserInDb.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (user) {
          console.log(`FOUND USER in database "${dbInfo.name}":`, { email: user.email, role: user.role });
          const isMatch = await bcrypt.compare(plainPassword, user.password);
          console.log(`Password match with "${plainPassword}":`, isMatch);
          return await mongoose.disconnect();
      }
  }

  console.log('User not found by email. Listing collections in "hospital_backend"...');
  const hmsDb = mongoose.connection.useDb('hospital_backend');
  const collections = await hmsDb.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  if (collections.some(c => c.name === 'users')) {
      console.log('Found "users" collection, listing first 5 documents...');
      const users = await hmsDb.db.collection('users').find().limit(5).toArray();
      console.log('Users in raw collection:', users.map(u => ({ email: u.email, role: u.role })));
  }

  await mongoose.disconnect();
}

debug().catch(console.error);
