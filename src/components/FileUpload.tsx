import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileUpload: (fileData: FileData) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFile = useCallback(async (file: File) => {
    setError('');
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit for all files
      setError('File size must be less than 50MB');
      return;
    }

    try {
      let content = '';
      
      // Handle different file types
      if (file.type.startsWith('text/') || 
          file.name.match(/\.(txt|md|json|csv|xml|html|css|js|ts|jsx|tsx|py|java|cpp|c|h|php|rb|go|rs|swift|kt|scala|sh|bat|ps1|yaml|yml|toml|ini|cfg|conf|log)$/i)) {
        // Text-based files
        content = await file.text();
      } else if (file.type === 'application/json') {
        content = await file.text();
      } else if (file.type.startsWith('image/')) {
        // For images, we'll extract basic metadata
        content = `Image File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(2)} KB\nLast Modified: ${new Date(file.lastModified).toLocaleString()}`;
      } else if (file.type === 'application/pdf') {
        // For PDFs, show metadata (actual PDF parsing would require additional libraries)
        content = `PDF Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nLast Modified: ${new Date(file.lastModified).toLocaleString()}\n\nNote: PDF content extraction requires additional processing. This shows file metadata.`;
      } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        // For media files, show metadata
        content = `Media File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / (1024 * 1024)).toFixed(2)} MB\nLast Modified: ${new Date(file.lastModified).toLocaleString()}`;
      } else {
        // For other binary files, show basic info
        content = `Binary File: ${file.name}\nType: ${file.type || 'Unknown'}\nSize: ${(file.size / 1024).toFixed(2)} KB\nLast Modified: ${new Date(file.lastModified).toLocaleString()}\n\nNote: Binary file content cannot be displayed as text.`;
      }

      const fileData: FileData = {
        content,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified)
      };

      onFileUpload(fileData);
    } catch (err) {
      setError('Failed to read file. Please try again.');
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-8">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 transform
          ${isDragOver 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-6">
          <div className={`mx-auto p-6 rounded-full w-fit transition-all duration-300 ${
            isDragOver 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transform scale-110' 
              : isProcessing 
                ? 'bg-gray-100' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100'
          }`}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            ) : (
              <Upload className={`h-12 w-12 transition-colors duration-300 ${
                isDragOver ? 'text-white' : 'text-gray-600'
              }`} />
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {isProcessing ? 'Processing your file...' : isDragOver ? 'Drop it here!' : 'Upload Your File'}
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              {isProcessing ? 'Please wait while we process your file' : 'Drag and drop any file here'}
            </p>
            <p className="text-sm text-gray-500">
              or click anywhere to browse your files
            </p>
          </div>
          
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Supports all file types • Max 50MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Text & Code Files</h4>
              <p className="text-sm text-blue-800 mb-3">Perfect formatting preservation for:</p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Documents (.txt, .md, .rtf)</li>
                <li>• Code files (.js, .py, .java, .cpp)</li>
                <li>• Data files (.json, .csv, .xml)</li>
                <li>• Configuration files (.yaml, .ini)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Media & Binary Files</h4>
              <p className="text-sm text-purple-800 mb-3">Metadata extraction for:</p>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Images (.jpg, .png, .gif, .svg)</li>
                <li>• Documents (.pdf, .docx, .xlsx)</li>
                <li>• Media files (.mp4, .mp3, .avi)</li>
                <li>• Archives (.zip, .tar, .rar)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}