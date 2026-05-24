const mongoose = require('mongoose');

let isConnected = false;

async function connectToMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGO_DB_NAME || 'markzy';
  if (isConnected) return mongoose.connection;
  if (!uri) throw new Error('Missing MONGODB_URI environment variable');
  await mongoose.connect(uri, { dbName, autoIndex: false });
  isConnected = true;
  return mongoose.connection;
}

function getMongoose() {
  if (!isConnected) throw new Error('Mongo not connected. Call connectToMongo() first.');
  return mongoose;
}

module.exports = { connectToMongo, getMongoose };
module.exports.default = module.exports;
