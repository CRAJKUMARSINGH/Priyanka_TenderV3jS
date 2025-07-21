export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const [day, month, year] = dateStr.split('-');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = new Date(`${fullYear}-${month}-${day}`);
    
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr; // Return original if parsing fails
  }
}

export function validateExcelFile(file: File): boolean {
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return allowedExtensions.includes(fileExtension);
}

export function getFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function convertToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  if (num === 0) return "Zero";

  let words = "";

  // Handle crores
  if (Math.floor(num / 10000000)) {
    words += convertToWords(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }

  // Handle lakhs
  if (Math.floor(num / 100000)) {
    words += convertToWords(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }

  // Handle thousands
  if (Math.floor(num / 1000)) {
    words += convertToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  // Handle hundreds
  if (Math.floor(num / 100)) {
    words += convertToWords(Math.floor(num / 100)) + " Hundred ";
    num %= 100;
  }

  // Handle remaining numbers
  if (num > 0) {
    if (words !== "") words += "and ";
    if (num < 10) words += ones[num];
    else if (num < 20) words += teens[num - 10];
    else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) words += " " + ones[num % 10];
    }
  }

  return words.trim();
}
