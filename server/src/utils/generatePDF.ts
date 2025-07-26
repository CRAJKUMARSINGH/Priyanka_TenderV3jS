// server/src/utils/generatePDF.ts
import puppeteer from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';

export const generatePDF = async (html: string) => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteerOptions: { headless: true, args: ['--no-sandbox'] },
  });

  let pdf: Buffer;
  await cluster.task(async ({ page }) => {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdf = await page.pdf({ format: 'A4', printBackground: true });
  });
  await cluster.execute('');
  await cluster.idle();
  await cluster.close();
  return pdf!;
};