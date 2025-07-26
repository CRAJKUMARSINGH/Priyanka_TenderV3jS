// server/src/services/bidderService.ts
import { Bidder } from '../models/Bidder';

export const computePercentile = (bidders: Bidder[]) => {
  if (bidders.length < 2) {
    return bidders.map(b => ({ ...b, percentile: 100 }));
  }
  const sorted = [...bidders].sort((a, b) => a.amount - b.amount);
  return sorted.map((b, idx) => ({
    ...b,
    percentile: parseFloat(
      (((idx) / (sorted.length - 1)) * 100).toFixed(2)
    ),
  }));
};

export const getRecentBidders = async () =>
  Bidder.find().sort({ createdAt: -1 }).limit(44).lean();