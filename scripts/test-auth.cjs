require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectToMongo } = require('../services/mongoClient');
const User = require('../services/models/User');

async function main() {
  await connectToMongo();
  const email = process.env.TEST_EMAIL || 'test@example.com';
  const password = process.env.TEST_PASSWORD || 'password123';
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User exists, deleting for test');
      await User.findByIdAndDelete(existing.id || existing._id);
    }
    const hashed = await bcrypt.hash(password, 12);
    const u = await User.create({ email, password: hashed, name: 'Tester' });
    console.log('Created user:', u.id || u._id);
    const found = await User.findOne({ email });
    const ok = await bcrypt.compare(password, found.password);
    console.log('Password matches?', ok);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
