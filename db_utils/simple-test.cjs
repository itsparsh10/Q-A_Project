/**
 * Quick MongoDB connectivity check.
 */
require('dotenv').config({ path: '.env.local' });
const { connectToMongo } = require('../services/mongoClient');

async function main() {
  console.log('\n🔌 MongoDB connection test\n');
  try {
    const conn = await connectToMongo();
    const db = conn.db;
    const users = await db.collection('users').findOne({});
    console.log('✅ Connected to MongoDB. users collection accessible.');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connectivity test failed:', err.message || err);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
