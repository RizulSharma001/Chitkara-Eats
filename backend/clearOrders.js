import mongoose from 'mongoose';
import connectDB from './db/connectDB.js';
import Order from './models/orders.js';

async function clearOrders() {
  try {
    await connectDB();
    const result = await Order.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} orders`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearOrders();
