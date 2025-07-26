// server/src/routes/download.ts
import archiver from 'archiver';
import { getRecentBidders } from '../services/bidderService';
import { generatePDF } from '../utils/generatePDF';

export const downloadAll = async (req, res) => {
  const bidders = await getRecentBidders();
  const archive = archiver('zip', { store: true });

  res.attachment('tender-docs.zip');
  archive.pipe(res);

  for (const bidder of bidders) {
    const html = /* your template html */;
    const pdf = await generatePDF(html);
    archive.append(pdf, { name: `${bidder._id}.pdf` });
  }

  await archive.finalize();
};