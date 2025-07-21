import JSZip from 'jszip';

export interface DocumentFile {
  name: string;
  content: string; // Base64 encoded content
  type: string;
}

export async function generateZipFile(documents: DocumentFile[]): Promise<Blob> {
  const zip = new JSZip();
  
  // Add each document to the ZIP
  documents.forEach(doc => {
    // Convert base64 to binary data
    const binaryData = atob(doc.content);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    zip.file(doc.name, bytes, { binary: true });
  });
  
  // Generate the ZIP file
  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });
  
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function createTenderDocumentPackage(
  tenderData: any,
  documents: Array<{ type: string; content: string }>
): Promise<Blob> {
  const documentFiles: DocumentFile[] = documents.map(doc => ({
    name: `${doc.type}_${Date.now()}.pdf`,
    content: doc.content,
    type: 'application/pdf'
  }));
  
  // Add a manifest file
  const manifest = {
    generatedAt: new Date().toISOString(),
    tenderNumber: tenderData.tenderNumber || 'N/A',
    workDescription: tenderData.workDescription || 'N/A',
    documentsIncluded: documentFiles.map(doc => doc.name)
  };
  
  documentFiles.push({
    name: 'manifest.json',
    content: btoa(JSON.stringify(manifest, null, 2)),
    type: 'application/json'
  });
  
  return generateZipFile(documentFiles);
}
