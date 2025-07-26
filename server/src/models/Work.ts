import mongoose from 'mongoose';

const workSchema = new mongoose.Schema(
  {
    workNo: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    estimatedCost: Number,
    gScheduleAmount: Number,
  },
  { timestamps: true }
);

export const Work = mongoose.model('Work', workSchema);