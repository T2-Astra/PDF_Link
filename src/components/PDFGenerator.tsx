import React, { useState } from 'react';
import { Download, FileText, CheckCircle, Link, Copy } from 'lucide-react';
import { ProcessedContent } from '../types';
import jsPDF from 'jspdf';

interface PDFGeneratorProps {
  content: ProcessedContent;
  fileName: string;
}

export function PDFGenerator({ content, fileName }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      let currentY = margin;
      const lineHeight = 7;
      const paragraphSpacing = 4;
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(content.title, maxWidth);
      titleLines.forEach((line: string) => {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += lineHeight + 2;
      });
      
      currentY += 10; // Extra spacing after title
      
      // Process each line while preserving original format
      content.lines.forEach((line, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - margin - 20) {
          pdf.addPage();
          currentY = margin;
        }
        
        let fontSize = 12;
        let fontStyle = 'normal';
        
        // Only apply special formatting for metadata headers (non-text files)
        if (line.type === 'heading') {
          fontSize = line.level === 1 ? 16 : line.level === 2 ? 14 : 13;
          fontStyle = 'bold';
          currentY += index > 0 ? 8 : 0; // Extra spacing before headings (except first)
        }
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        // Preserve original text exactly as is - no modifications
        const textToRender = line.text;
        
        // Handle text wrapping while preserving spaces and formatting
        const textLines = pdf.splitTextToSize(textToRender, maxWidth);
        
        textLines.forEach((textLine: string) => {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          pdf.text(textLine, margin, currentY);
          currentY += lineHeight;
        });
        
        // Add minimal spacing between lines to preserve original format
        currentY += 1;
        
        // Reset font for next line
        pdf.setFont('helvetica', 'normal');
      });
      
      // Generate blob
      const pdfOutput = pdf.output('blob');
      setPdfBlob(pdfOutput);
      
      // Create download URL
      const url = URL.createObjectURL(pdfOutput);
      setDownloadUrl(url);
      setIsGenerated(true);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
    
    setIsGenerating(false);
  };

  const downloadPDF = () => {
    if (pdfBlob) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${fileName.replace(/\.[^/.]+$/, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">PDF Generator</h3>
              <p className="text-sm text-gray-600">Convert your file to professional PDF format</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {!isGenerated ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate PDF</h4>
                <p className="text-gray-600">Your file will be converted while preserving its original format and structure</p>
              </div>
              
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="font-medium">Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">PDF Generated Successfully!</h4>
                  <p className="text-sm text-green-700">Your file has been converted to PDF format</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Link className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Download Link</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={downloadUrl}
                    readOnly
                    className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-3 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => window.open(downloadUrl, '_blank')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Preview PDF</span>
                </button>
                
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-medium">Download PDF</span>
                </button>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsGenerated(false);
                    setPdfBlob(null);
                    setDownloadUrl('');
                    setCopySuccess(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Generate New PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-blue-900">Format Preservation</span>
        </div>
        <p className="text-sm text-blue-800">
          Your PDF maintains the exact original formatting, spacing, and structure of your uploaded file.
        </p>
      </div>
    </div>
  );
}