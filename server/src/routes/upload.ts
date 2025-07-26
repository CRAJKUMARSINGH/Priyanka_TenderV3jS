import express from 'express';
import multer from 'multer';
import { parseExcel } from '../utils/parseExcel';
import { Bidder } from '../models/Bidder';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const bidders = parseExcel(req.file.buffer);

    // drop old data or append — choose one
    await Bidder.deleteMany({});
    await Bidder.insertMany(bidders);

    res.json({ inserted: bidders.length });
  } catch (err) {
    res.status(422).json({ error: (err as Error).message });
  }
});

export default router;