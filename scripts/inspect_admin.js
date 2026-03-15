import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: true },
  role: { type: String },
  status: { type: String, default: 'Active' },
});

const User = mongoose.model('User', userSchema);

async function inspectAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = mongoose.connection.useDb('admin').db.admin();
  const dbs = await admin.listDatabases();
  
  for (const dbInfo of dbs.databases) {
      if (['admin', 'config', 'local'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      
      if (collections.some(c => c.name === 'users')) {
          const admins = await db.db.collection('users').find({ role: /admin/i }).toArray();
          if (admins.length > 0) {
              console.log(`\n!!! FOUND ADMINS IN DB "${dbInfo.name}" !!!`);
              for (const u of admins) {
                  console.log(` - ${u.email} | Status: ${u.status}`);
                  const common = ['admin@123', 'adminpassword', 'admin123', 'password', 'rohit@123'];
                  for (const p of common) {
                      const match = await bcrypt.compare(p, u.password || '');
                      if (match) console.log(`   PASSWORD MATCH: "${p}"`);
                  }
              }
          }
      }
  }

  await mongoose.disconnect();
}

inspectAdmin().catch(console.error);
