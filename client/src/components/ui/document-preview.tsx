import { Card, CardContent } from "@/components/ui/card";
import { TenderData, Bidder } from "@shared/schema";
import { convertToWords } from "@/lib/document-utils";

interface DocumentPreviewProps {
  tenderData: TenderData;
}

export function DocumentPreview({ tenderData }: DocumentPreviewProps) {
  const bidders = tenderData.bidders as Bidder[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Comparative Statement Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span> Comparative Statement (A4 Landscape)
          </h4>
          <div className="document-preview a4-landscape border rounded-lg p-4 text-xs overflow-hidden">
            <div className="text-center font-bold mb-4">
              <div>OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION, UDAIPUR</div>
              <div className="mt-2">COMPARATIVE STATEMENT OF TENDERS</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>Name of Work: <span>{tenderData.workName}</span></div>
              <div>NIT No.: <span>{tenderData.nitNumber}</span></div>
            </div>
            
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-1">S.No</th>
                  <th className="border border-gray-400 p-1">Bidder Name</th>
                  <th className="border border-gray-400 p-1">Estimated Cost Rs.</th>
                  <th className="border border-gray-400 p-1">Quoted %</th>
                  <th className="border border-gray-400 p-1">Quoted Amount Rs.</th>
                </tr>
              </thead>
              <tbody>
                {bidders.map((bidder) => (
                  <tr key={bidder.sno}>
                    <td className="border border-gray-400 p-1">{bidder.sno}</td>
                    <td className="border border-gray-400 p-1">{bidder.name}</td>
                    <td className="border border-gray-400 p-1">{bidder.estimatedCost}</td>
                    <td className="border border-gray-400 p-1">{bidder.quotedPercentage}</td>
                    <td className="border border-gray-400 p-1">{bidder.quotedAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Right-aligned bordered box (60% width) */}
            <div className="bordered-box mt-6">
              <div className="text-center">
                <p className="font-semibold">Lowest Amount Quoted BY:</p>
                <p>{tenderData.lowestBidder}</p>
                <p>{tenderData.lowestPercentage} - Rs. {tenderData.lowestAmount.toLocaleString('en-IN')}</p>
                <p className="italic text-xs my-1">in words Rupees {convertToWords(tenderData.lowestAmount)} only</p>
                <p className="font-bold text-xs">is hereby approved.</p>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center border-t pt-2">
                <div>AR</div>
                <div>DA</div>
                <div>TA</div>
                <div>EE</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scrutiny Sheet Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔍</span> Scrutiny Sheet (A4 Portrait)
          </h4>
          <div className="document-preview a4-portrait border rounded-lg p-4 text-xs overflow-hidden">
            <div className="text-center font-bold mb-4">
              <div>Scrutiny Sheet of Tender</div>
            </div>
            
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="w-8">1</td><td>Head of Account</td><td>8443</td></tr>
                <tr><td>2</td><td>Name of work</td><td>{tenderData.workName}</td></tr>
                <tr><td>3</td><td>Reference of ADM. Sanction</td><td>-</td></tr>
                <tr><td></td><td>Amount in Rs.</td><td>{tenderData.estimatedAmount}</td></tr>
                <tr><td>4</td><td>Reference of technical sanction with amount</td><td>-</td></tr>
                <tr><td>5</td><td>Date of calling NIT</td><td>{tenderData.nitDate}</td></tr>
                <tr><td>6</td><td>Date of receipt of tender</td><td>{tenderData.receiptDate}</td></tr>
                <tr><td>7</td><td>No. of tender sold</td><td>{tenderData.tendersSold}</td></tr>
                <tr><td>8</td><td>No. of tender received</td><td>{tenderData.tendersReceived}</td></tr>
                <tr><td>9</td><td>Allotment of fund</td><td>Adequate</td></tr>
                <tr><td>10</td><td>Expenditure up to last bill</td><td>Nil</td></tr>
                <tr><td>11</td><td>Lowest rate quoted</td><td>{tenderData.lowestPercentage}</td></tr>
                <tr><td>12</td><td>Financial implication</td><td>Not Applicable</td></tr>
                <tr><td>13</td><td>Name of lowest contractor</td><td>{tenderData.lowestBidder}</td></tr>
                <tr><td>14</td><td>Authority competent to sanction</td><td>The Executive Engineer</td></tr>
                <tr><td>15</td><td>Validity of tender</td><td>20 Days</td></tr>
                <tr><td>16</td><td>Remarks if any</td><td>None</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📄</span> Work Order (A4 Portrait)
          </h4>
          <div className="document-preview a4-portrait border rounded-lg p-4 text-xs overflow-hidden">
            <div className="text-center font-bold mb-4">
              <div>WRITTEN ORDER TO COMMENCE WORK</div>
            </div>
            
            <div className="mb-4">
              <div>To,</div>
              <div>{tenderData.lowestBidder}</div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div>Name of Work: <span>{tenderData.workName}</span></div>
              <div>NIT No.: <span>{tenderData.nitNumber}</span></div>
              <div>NIT Date: <span>{tenderData.nitDate}</span></div>
              <div>Tender Receipt Date: <span>{tenderData.receiptDate}</span></div>
            </div>
            
            <div className="mb-4">
              <p>Dear Sir,</p>
              <p className="mt-2">You are therefore, requested to please contact the Assistant Engineer-in-Charge and start the work. The time allowed for commencement of work shall be reckoned from 1st days after the receipt of this order.</p>
            </div>
            
            <div className="space-y-1">
              <div>Agreement No.: /2025-26</div>
              <div>Stipulated date for commencement: 25-03-25</div>
              <div>Stipulated date for completion: 24-12-25</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Letter Preview */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">✅</span> Acceptance Letter (A4 Portrait)
          </h4>
          <div className="document-preview a4-portrait border rounded-lg p-4 text-xs overflow-hidden">
            <div className="text-center font-bold mb-4">
              <div>OFFICE OF THE EXECUTIVE ENGINEER PWD ELECTRIC DIVISION UDAIPUR</div>
              <div className="mt-2">(Letter of Acceptance of Tender)</div>
            </div>
            
            <div className="mb-4">
              <div>To,</div>
              <div>{tenderData.lowestBidder}</div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div>Name of Work: <span>{tenderData.workName}</span></div>
              <div>NIT No.: <span>{tenderData.nitNumber}</span></div>
              <div>NIT Date: <span>{tenderData.nitDate}</span></div>
              <div>Tender Receipt Date: <span>{tenderData.receiptDate}</span></div>
            </div>
            
            <div className="mb-4">
              <p>Dear Sir,</p>
              <p className="mt-2">Your tender for the above work has been accepted. Security Deposit as per rule of the gross amount shall be deducted from each running bill or you may opt to deposit full amount of security deposit in the shape of bank guarantee.</p>
              <p className="mt-2">Kindly submit the required stamp duty of Rs. 1000/- as per rule and sign the agreement within 3 days.</p>
            </div>
            
            <div className="mt-4">
              <div>Yours Faithfully,</div>
              <div className="mt-2">Executive Engineer</div>
              <div>On behalf of the Governor of State of Rajasthan</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
