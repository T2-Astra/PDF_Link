export interface ProcessedLine {
  type: 'heading' | 'bullet' | 'numbered' | 'paragraph';
  level: number;
  text: string;
}

export interface ProcessedContent {
  lines: ProcessedLine[];
  originalContent: string;
  title: string;
  fileType?: string;
  metadata?: {
    size: number;
    lastModified: Date;
    mimeType: string;
  };
}

export interface FileData {
  content: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
}