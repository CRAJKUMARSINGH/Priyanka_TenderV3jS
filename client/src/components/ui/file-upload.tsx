import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { processExcelFile } from "@/lib/excel-processor";

interface FileUploadProps {
  onUpload: (fileData: any, fileName: string) => void;
  isLoading?: boolean;
}

export default function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const processedData = await processExcelFile(selectedFile);
      onUpload(processedData, selectedFile.name);
    } catch (error) {
      console.error('Failed to process Excel file:', error);
      alert('Failed to process Excel file. Please check the file format.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Upload Excel File
          </h3>
          <p className="text-gray-500 mb-4">
            Upload your work detail Excel file to begin tender processing
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            id="excel-upload"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Choose Excel File
            </label>
          </Button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Supported formats: .xlsx, .xls | Max size: 10MB</p>
          </div>
        </div>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="text-green-600 text-2xl" />
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for upload
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Processing..." : "Upload"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={removeFile}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
