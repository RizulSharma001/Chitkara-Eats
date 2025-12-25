import 'dotenv/config';
import connectDB from './db/connectDB.js';
import User from './models/user.js';

async function reset() {
  try {
    await connectDB();
    const result = await User.updateMany({}, { $set: { uMoneyBalance: 0 } });
    console.log('Reset uMoneyBalance for users:', result.modifiedCount || result.nModified || result.n);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting balances:', err);
    process.exit(1);
  }
}

reset();
