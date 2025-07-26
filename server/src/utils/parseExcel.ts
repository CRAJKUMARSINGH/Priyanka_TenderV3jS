import * as XLSX from 'xlsx';

export interface ParsedRow {
  name: string;
  address: string;
  percentile: number | null;
}

export function parseExcel(buffer: Buffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // assume columns: A=Name, B=Address
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
  return rows
    .slice(1) // skip header
    .filter(row => row[0]?.trim()) // non-empty name
    .map(row => ({
      name: row[0]?.trim() || '',
      address: row[1]?.trim() || '',
      percentile: null,
    }));
}