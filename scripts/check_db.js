import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to:', mongoose.connection.host);
  console.log('Database Name:', mongoose.connection.name);
  
  const admin = mongoose.connection.useDb('admin').db.admin();
  const dbs = await admin.listDatabases();
  
  for (const dbInfo of dbs.databases) {
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      if (collections.some(c => c.name === 'users')) {
          const user = await db.db.collection('users').findOne({ email: /r@gmail.com/i });
          if (user) {
              console.log(`FOUND USER IN DB "${dbInfo.name}":`, user.email);
              console.log('User Role:', user.role);
              return;
          }
      }
  }
  console.log('USER r@gmail.com NOT FOUND IN ANY DATABASE');
  await mongoose.disconnect();
}

check().catch(console.error);
