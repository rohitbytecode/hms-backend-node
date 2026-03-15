import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function exhaustiveSearch() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Atlas');

  const admin = mongoose.connection.useDb('admin').db.admin();
  const dbs = await admin.listDatabases();
  
  for (const dbInfo of dbs.databases) {
      if (['admin', 'config', 'local'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      
      for (const col of collections) {
          const match = await db.db.collection(col.name).findOne({ email: /r@gmail.com/i });
          if (match) {
              console.log(`!!! MATCH FOUND !!!`);
              console.log(`Database: ${dbInfo.name}`);
              console.log(`Collection: ${col.name}`);
              console.log(`Data:`, JSON.stringify(match, null, 2));
          }
      }
  }
  
  console.log('Search complete.');
  await mongoose.disconnect();
}

exhaustiveSearch().catch(console.error);
