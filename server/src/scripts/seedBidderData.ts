import mongoose from 'mongoose';
import { Bidder } from '../models/Bidder';
import dotenv from 'dotenv';
dotenv.config();

const bidderData = [
  { name: 'Arun Electricals', address: 'fatehpuria Bazar, Pali' },
  { name: 'Ashapura Electric', address: 'UDAIPUR' },
  { name: 'Bhawani air systems', address: 'Jaipur' },
  // ... paste the remaining 41 rows exactly as above ...
  { name: 'Yash Electricals', address: 'Udaipur' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tender');
  await Bidder.deleteMany({});
  await Bidder.insertMany(bidderData.map(b => ({ ...b, percentile: null })));
  console.log('Inserted 44 bidders');
  await mongoose.disconnect();
}
seed();