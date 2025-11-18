'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface PDFViewerProps {
  file: File;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (err: Error) => {
    let errorMessage = 'Failed to load PDF';
    if (err.message.includes('Object.defineProperty called on non-object')) {
      errorMessage = 'The PDF file appears to be corrupted or unsupported. Please try uploading a different PDF.';
    } else {
      errorMessage = `Failed to load PDF: ${err.message}`;
    }
    setError(errorMessage);
    console.error(err);
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="border rounded-lg overflow-auto max-h-96">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div className="flex items-center justify-center h-64"><div>Loading PDF preview...</div></div>}
      >
        <Page pageNumber={1} scale={1.2} />
      </Document>
    </div>
  );
}