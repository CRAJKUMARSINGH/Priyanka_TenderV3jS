import express from 'express';
import { Bidder } from '../models/Bidder';

const router = express.Router();

router.get('/', async (_req, res) => {
  const bidders = await Bidder.find().sort({ createdAt: -1 }).limit(44);
  res.json(bidders);   // ← always 44 rows
});

router.patch('/:id', async (req, res) => {
  const updated = await Bidder.findByIdAndUpdate(
    req.params.id,
    { percentile: Number(req.body.percentile) },
    { new: true }
  );
  res.json(updated);
});

export default router;