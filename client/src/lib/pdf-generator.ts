import jsPDF from 'jspdf';

export interface TenderDocument {
  tenderNumber: string;
  workDescription: string;
  estimatedAmount: string;
  bidders: Array<{
    name: string;
    address: string;
    percentage: number;
  }>;
  items?: Array<{
    srNo: number;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
}

export async function generateTenderPDF(data: TenderDocument): Promise<string> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TENDER DOCUMENT', 105, 20, { align: 'center' });
    
    // Government Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Public Works Department, Udaipur', 105, 30, { align: 'center' });
    doc.text('An Initiative By Mrs. Premlata Jain, Additional Administrative Officer', 105, 38, { align: 'center' });
    
    // Line separator
    doc.line(20, 45, 190, 45);
    
    // Tender Details
    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tender Details:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tender Number: ${data.tenderNumber}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Estimated Amount: ₹ ${parseFloat(data.estimatedAmount).toLocaleString('en-IN')}`, 20, yPos);
    
    yPos += 8;
    doc.text('Work Description:', 20, yPos);
    yPos += 6;
    const splitDesc = doc.splitTextToSize(data.workDescription, 150);
    doc.text(splitDesc, 20, yPos);
    yPos += splitDesc.length * 5 + 5;
    
    // Bidders Section
    if (data.bidders && data.bidders.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Participating Bidders:', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      data.bidders.forEach((bidder, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${bidder.name}`, 25, yPos);
        yPos += 5;
        doc.text(`   Address: ${bidder.address}`, 25, yPos);
        yPos += 5;
        doc.text(`   Percentage: ${bidder.percentage >= 0 ? '+' : ''}${bidder.percentage}%`, 25, yPos);
        yPos += 8;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('🎉 Efficient Tendering - Making procurement transparent & easy', 105, 285, { align: 'center' });
    
    const pdfOutput = doc.output('datauristring');
    resolve(pdfOutput.split('base64,')[1]);
  });
}

export async function generateComparisonSheet(data: TenderDocument): Promise<string> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BIDDER COMPARISON SHEET', 105, 20, { align: 'center' });
    
    // Government Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Public Works Department, Udaipur', 105, 30, { align: 'center' });
    doc.text('An Initiative By Mrs. Premlata Jain, Additional Administrative Officer', 105, 38, { align: 'center' });
    
    // Line separator
    doc.line(20, 45, 190, 45);
    
    // Tender Details
    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tender: ${data.tenderNumber}`, 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Estimated Amount: ₹ ${parseFloat(data.estimatedAmount).toLocaleString('en-IN')}`, 20, yPos);
    
    // Table Headers
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Draw table headers
    doc.rect(20, yPos - 5, 25, 10);
    doc.text('S.No', 22, yPos);
    
    doc.rect(45, yPos - 5, 80, 10);
    doc.text('Bidder Name & Address', 47, yPos);
    
    doc.rect(125, yPos - 5, 25, 10);
    doc.text('Percentage', 127, yPos);
    
    doc.rect(150, yPos - 5, 40, 10);
    doc.text('Quoted Amount (₹)', 152, yPos);
    
    yPos += 10;
    
    // Table Data
    doc.setFont('helvetica', 'normal');
    const baseAmount = parseFloat(data.estimatedAmount);
    
    data.bidders.forEach((bidder, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const quotedAmount = baseAmount * (1 + bidder.percentage / 100);
      
      // Row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 5, 170, 15, 'F');
      }
      
      // S.No
      doc.rect(20, yPos - 5, 25, 15);
      doc.text((index + 1).toString(), 32, yPos, { align: 'center' });
      
      // Bidder Details
      doc.rect(45, yPos - 5, 80, 15);
      const bidderText = doc.splitTextToSize(`${bidder.name}\n${bidder.address}`, 76);
      doc.text(bidderText, 47, yPos);
      
      // Percentage
      doc.rect(125, yPos - 5, 25, 15);
      const percentText = `${bidder.percentage >= 0 ? '+' : ''}${bidder.percentage}%`;
      doc.text(percentText, 137, yPos + 2, { align: 'center' });
      
      // Quoted Amount
      doc.rect(150, yPos - 5, 40, 15);
      doc.text(quotedAmount.toLocaleString('en-IN'), 152, yPos + 2);
      
      yPos += 15;
    });
    
    // Summary
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Bidders: ${data.bidders.length}`, 20, yPos);
    yPos += 6;
    
    const lowestBidder = data.bidders.reduce((min, bidder) => 
      bidder.percentage < min.percentage ? bidder : min
    );
    doc.text(`Lowest Bid: ${lowestBidder.name} (${lowestBidder.percentage >= 0 ? '+' : ''}${lowestBidder.percentage}%)`, 20, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('🎉 Efficient Tendering - Making procurement transparent & easy', 105, 285, { align: 'center' });
    
    const pdfOutput = doc.output('datauristring');
    resolve(pdfOutput.split('base64,')[1]);
  });
}

export async function generateWorkSummary(data: TenderDocument): Promise<string> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('WORK SUMMARY REPORT', 105, 20, { align: 'center' });
    
    // Government Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Public Works Department, Udaipur', 105, 30, { align: 'center' });
    doc.text('An Initiative By Mrs. Premlata Jain, Additional Administrative Officer', 105, 38, { align: 'center' });
    
    // Line separator
    doc.line(20, 45, 190, 45);
    
    // Tender Details
    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Overview:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tender Number: ${data.tenderNumber}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Estimated Cost: ₹ ${parseFloat(data.estimatedAmount).toLocaleString('en-IN')}`, 20, yPos);
    
    yPos += 8;
    doc.text('Work Description:', 20, yPos);
    yPos += 6;
    const splitDesc = doc.splitTextToSize(data.workDescription, 150);
    doc.text(splitDesc, 20, yPos);
    yPos += splitDesc.length * 5 + 10;
    
    // Work Items (if available)
    if (data.items && data.items.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Work Items Breakdown:', 20, yPos);
      yPos += 15;
      
      // Table Headers
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.rect(20, yPos - 5, 15, 8);
      doc.text('Sr.', 21, yPos);
      
      doc.rect(35, yPos - 5, 70, 8);
      doc.text('Description', 37, yPos);
      
      doc.rect(105, yPos - 5, 20, 8);
      doc.text('Qty', 107, yPos);
      
      doc.rect(125, yPos - 5, 15, 8);
      doc.text('Unit', 127, yPos);
      
      doc.rect(140, yPos - 5, 25, 8);
      doc.text('Rate (₹)', 142, yPos);
      
      doc.rect(165, yPos - 5, 25, 8);
      doc.text('Amount (₹)', 167, yPos);
      
      yPos += 8;
      
      // Table Data
      doc.setFont('helvetica', 'normal');
      data.items.forEach((item, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        const rowHeight = 12;
        
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, yPos - 5, 170, rowHeight, 'F');
        }
        
        doc.rect(20, yPos - 5, 15, rowHeight);
        doc.text(item.srNo.toString(), 21, yPos);
        
        doc.rect(35, yPos - 5, 70, rowHeight);
        const itemDesc = doc.splitTextToSize(item.description, 68);
        doc.text(itemDesc, 37, yPos);
        
        doc.rect(105, yPos - 5, 20, rowHeight);
        doc.text(item.quantity.toString(), 107, yPos);
        
        doc.rect(125, yPos - 5, 15, rowHeight);
        doc.text(item.unit, 127, yPos);
        
        doc.rect(140, yPos - 5, 25, rowHeight);
        doc.text(item.rate.toLocaleString('en-IN'), 142, yPos);
        
        doc.rect(165, yPos - 5, 25, rowHeight);
        doc.text(item.amount.toLocaleString('en-IN'), 167, yPos);
        
        yPos += rowHeight;
      });
      
      // Total
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.rect(140, yPos - 5, 50, 10);
      doc.text('Total: ₹ ' + data.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN'), 142, yPos);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('🎉 Efficient Tendering - Making procurement transparent & easy', 105, 285, { align: 'center' });
    
    const pdfOutput = doc.output('datauristring');
    resolve(pdfOutput.split('base64,')[1]);
  });
}

export async function generateFinancialAnalysis(data: TenderDocument): Promise<string> {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL ANALYSIS REPORT', 105, 20, { align: 'center' });
    
    // Government Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Public Works Department, Udaipur', 105, 30, { align: 'center' });
    doc.text('An Initiative By Mrs. Premlata Jain, Additional Administrative Officer', 105, 38, { align: 'center' });
    
    // Line separator
    doc.line(20, 45, 190, 45);
    
    // Basic Information
    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Financial Summary:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tender: ${data.tenderNumber}`, 20, yPos);
    yPos += 8;
    doc.text(`Base Estimated Amount: ₹ ${parseFloat(data.estimatedAmount).toLocaleString('en-IN')}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Participating Bidders: ${data.bidders.length}`, 20, yPos);
    
    // Financial Analysis
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bid Analysis:', 20, yPos);
    
    yPos += 15;
    const baseAmount = parseFloat(data.estimatedAmount);
    
    // Calculate statistics
    const quotedAmounts = data.bidders.map(b => baseAmount * (1 + b.percentage / 100));
    const minAmount = Math.min(...quotedAmounts);
    const maxAmount = Math.max(...quotedAmounts);
    const avgAmount = quotedAmounts.reduce((sum, amt) => sum + amt, 0) / quotedAmounts.length;
    
    const lowestBidder = data.bidders.find(b => baseAmount * (1 + b.percentage / 100) === minAmount);
    const highestBidder = data.bidders.find(b => baseAmount * (1 + b.percentage / 100) === maxAmount);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Statistics Table
    doc.text('Financial Statistics:', 20, yPos);
    yPos += 10;
    
    doc.text(`• Lowest Quoted Amount: ₹ ${minAmount.toLocaleString('en-IN')} (${lowestBidder?.name})`, 25, yPos);
    yPos += 6;
    doc.text(`  Percentage: ${lowestBidder?.percentage >= 0 ? '+' : ''}${lowestBidder?.percentage}%`, 30, yPos);
    yPos += 10;
    
    doc.text(`• Highest Quoted Amount: ₹ ${maxAmount.toLocaleString('en-IN')} (${highestBidder?.name})`, 25, yPos);
    yPos += 6;
    doc.text(`  Percentage: ${highestBidder?.percentage >= 0 ? '+' : ''}${highestBidder?.percentage}%`, 30, yPos);
    yPos += 10;
    
    doc.text(`• Average Quoted Amount: ₹ ${avgAmount.toLocaleString('en-IN')}`, 25, yPos);
    yPos += 10;
    
    const savings = baseAmount - minAmount;
    doc.text(`• Potential Savings: ₹ ${Math.abs(savings).toLocaleString('en-IN')} ${savings >= 0 ? '(Below estimate)' : '(Above estimate)'}`, 25, yPos);
    
    // Recommendations
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    if (lowestBidder && lowestBidder.percentage < -10) {
      doc.text('⚠ Alert: Lowest bid is significantly below estimate. Verify bidder capability.', 20, yPos);
      yPos += 8;
    }
    
    doc.text(`✓ Recommended Award: ${lowestBidder?.name}`, 20, yPos);
    yPos += 6;
    doc.text(`  Financial Impact: ${savings >= 0 ? 'Cost savings' : 'Cost increase'} of ₹ ${Math.abs(savings).toLocaleString('en-IN')}`, 20, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('🎉 Efficient Tendering - Making procurement transparent & easy', 105, 285, { align: 'center' });
    
    const pdfOutput = doc.output('datauristring');
    resolve(pdfOutput.split('base64,')[1]);
  });
}
