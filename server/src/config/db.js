import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no está definido en .env');

  mongoose.set('strictQuery', true);

  // conecta y usa el nombre de base que esta en .env
  await mongoose.connect(uri, {
    dbName: process.env.DB_NAME || 'tvlc',
    autoIndex: true,       // crea índices de esquema en dev
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
}
