'use client';

import { useEffect, useRef, useState } from 'react';

interface PDFViewerProps {
  file: File;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPDF = async () => {
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };
        await page.render(renderContext).promise;
      } catch (err) {
        setError('Failed to load PDF');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    renderPDF();
  }, [file]);

  if (loading) return <div className="flex items-center justify-center h-64"><div>Loading PDF preview...</div></div>;

  if (error) return <div className="text-red-500">{error}</div>;

  return <canvas ref={canvasRef} className="border max-w-full h-auto" />;
}