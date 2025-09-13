import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { PDFGenerator } from './components/PDFGenerator';
import { Header } from './components/Header';
import { ProcessedContent, FileData } from './types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (fileData: FileData) => {
    setIsProcessing(true);
    setUploadedFile(fileData);

    const processed = processFileContent(fileData);
    setProcessedContent(processed);
    setIsProcessing(false);
  }, []);

  const processFileContent = (fileData: FileData): ProcessedContent => {
    // Keep original format - split by lines but preserve original spacing and formatting
    const lines = fileData.content.split('\n');
    const processedLines: ProcessedContent['lines'] = [];

    // Add file metadata as heading for non-text files
    const isTextFile = fileData.type.startsWith('text/') ||
      fileData.name.match(/\.(txt|md|json|csv|xml|html|css|js|ts|jsx|tsx|py|java|cpp|c|h|php|rb|go|rs|swift|kt|scala|sh|bat|ps1|yaml|yml|toml|ini|cfg|conf|log)$/i);

    if (!isTextFile) {
      processedLines.push({
        type: 'heading',
        level: 1,
        text: `File: ${fileData.name}`
      });

      processedLines.push({
        type: 'paragraph',
        level: 0,
        text: `Type: ${fileData.type || 'Unknown'} • Size: ${formatFileSize(fileData.size)} • Modified: ${fileData.lastModified.toLocaleDateString()}`
      });

      if (lines.length > 0 && lines.some(line => line.trim())) {
        processedLines.push({
          type: 'heading',
          level: 2,
          text: 'Content'
        });
      }
    }

    // Process each line while preserving original format
    lines.forEach(line => {
      // Preserve original line exactly as is - no trimming or filtering
      processedLines.push({
        type: 'paragraph',
        level: 0,
        text: line // Keep original spacing and formatting
      });
    });

    return {
      lines: processedLines,
      originalContent: fileData.content,
      title: fileData.name.replace(/\.[^/.]+$/, '') || 'Document',
      fileType: fileData.type,
      metadata: {
        size: fileData.size,
        lastModified: fileData.lastModified,
        mimeType: fileData.type
      }
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setProcessedContent(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {!uploadedFile ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                Universal File to PDF Converter
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Transform any file into a professional PDF while preserving its original format and structure.
                Perfect for documents, code files, data, and more.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Original Format</h3>
                <p className="text-sm text-gray-600">Files maintain their exact original formatting and structure</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">All File Types</h3>
                <p className="text-sm text-gray-600">Support for text, code, images, documents, and binary files</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional PDF</h3>
                <p className="text-sm text-gray-600">Clean, readable PDFs with proper formatting and styling</p>
              </div>
            </div>

            <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {uploadedFile.name}
                      </h3>
                      <p className="text-sm text-gray-600">Ready for PDF conversion</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Upload New File
                  </button>
                </div>
              </div>

              <div className="px-8 py-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{uploadedFile.type || 'Unknown'}</div>
                    <div className="text-sm text-gray-600 mt-1">File Type</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{formatFileSize(uploadedFile.size)}</div>
                    <div className="text-sm text-gray-600 mt-1">File Size</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{uploadedFile.content.split('\n').length}</div>
                    <div className="text-sm text-gray-600 mt-1">Lines</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">File uploaded successfully and ready for conversion</span>
                  </div>
                </div>
              </div>
            </div>

            {processedContent && (
              <PDFGenerator
                content={processedContent}
                fileName={uploadedFile.name}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;