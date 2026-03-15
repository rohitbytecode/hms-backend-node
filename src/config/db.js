import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('DB connection failed', error);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.connection.close(false);
}
export {
  connectDB, 
  closeDB
};