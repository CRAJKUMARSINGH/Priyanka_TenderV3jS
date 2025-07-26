import mongoose from 'mongoose';
import { Work } from '../models/Work.js';

await mongoose.connect('mongodb://localhost:27017/tender');
await Work.deleteMany({});
await Work.insertMany([
  { workNo: 1, name: 'WORK 1', estimatedCost: 185000, gScheduleAmount: 184744 },
  { workNo: 2, name: 'WORK 2', estimatedCost: 211000, gScheduleAmount: 210744 },
  { workNo: 3, name: 'WORK 3', estimatedCost: 237000, gScheduleAmount: 236744 },
  { workNo: 4, name: 'WORK 4', estimatedCost: 263000, gScheduleAmount: 262744 },
  { workNo: 5, name: 'WORK 5', estimatedCost: 289000, gScheduleAmount: 288744 },
  { workNo: 6, name: 'WORK 6', estimatedCost: 315000, gScheduleAmount: 314744 },
  { workNo: 7, name: 'WORK 7', estimatedCost: 341000, gScheduleAmount: 340744 },
  { workNo: 8, name: 'WORK 8', estimatedCost: 367000, gScheduleAmount: 366744 },
  { workNo: 9, name: 'WORK 9', estimatedCost: 393000, gScheduleAmount: 392744 },
  { workNo: 10, name: 'WORK 10', estimatedCost: 419000, gScheduleAmount: 418744 }
]);
console.log('Inserted 10 works');
await mongoose.disconnect();