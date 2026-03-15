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

async function inspect() {
  const adminUri = process.env.MONGO_URI;
  console.log(`Connecting to: ${adminUri}`);
  await mongoose.connect(adminUri);
  console.log('Connected');

  const admin = mongoose.connection.useDb('admin').db.admin();
  const dbs = await admin.listDatabases();
  console.log('Available databases:', dbs.databases.map(d => d.name));

  for (const dbInfo of dbs.databases) {
      if (['admin', 'config', 'local'].includes(dbInfo.name)) continue;
      console.log(`\n--- Scanning DB: ${dbInfo.name} ---`);
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      if (collections.some(c => c.name === 'users')) {
          const users = await db.db.collection('users').find({}).toArray();
          console.log(`Found ${users.length} users in "${dbInfo.name}".`);
          users.forEach(u => console.log(` - ${u.email} (${u.role}) [Status: ${u.status}]`));
      }
  }

  await mongoose.disconnect();
}

inspect().catch(console.error);
