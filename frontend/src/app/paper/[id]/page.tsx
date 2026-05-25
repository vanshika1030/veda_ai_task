'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import TopBar from '@/components/TopBar';
import QuestionPaper from '@/components/QuestionPaper';
import GeneratingOverlay from '@/components/GeneratingOverlay';
import { useAssignmentStore } from '@/store/assignmentStore';
import { wsClient } from '@/lib/websocket';

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const paperRef = useRef<HTMLDivElement>(null);

  const {
    currentAssignment,
    generatedPaper,
    isLoading,
    isGenerating,
    generationProgress,
    fetchAssignment,
    triggerGeneration,
    setGeneratedPaper,
    setGenerationProgress,
    setIsGenerating,
  } = useAssignmentStore();

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssignment(id);
    }
  }, [id, fetchAssignment]);

  // WebSocket listeners
  useEffect(() => {
    wsClient.connect();

    const unsubProgress = wsClient.on('generation:progress', (data: any) => {
      if (data.assignmentId === id) {
        setGenerationProgress(data.progress || 0);
      }
    });

    const unsubComplete = wsClient.on('generation:completed', (data: any) => {
      if (data.assignmentId === id) {
        setGeneratedPaper(data.paper);
        setIsGenerating(false);
      }
    });

    const unsubError = wsClient.on('generation:error', (data: any) => {
      if (data.assignmentId === id) {
        setIsGenerating(false);
        alert(`Generation failed: ${data.error}`);
      }
    });

    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };
  }, [id, setGeneratedPaper, setGenerationProgress, setIsGenerating]);

  const handleRegenerate = async () => {
    if (!id) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    await triggerGeneration(id);

    // Polling fallback
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/assignments/${id}`);
        const data = await res.json();
        if (data.status === 'completed' && data.generatedPaper) {
          clearInterval(pollInterval);
          setGeneratedPaper(data.generatedPaper);
          setIsGenerating(false);
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setIsGenerating(false);
        }
      } catch {}
    }, 3000);

    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  const handleDownloadPDF = async () => {
    if (!paperRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Handle multi-page
      const pageHeight = pdfHeight * (imgWidth / pdfWidth);
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;
      }

      const fileName = `${currentAssignment?.title || 'Question_Paper'}_${currentAssignment?.subject || ''}.pdf`
        .replace(/[^a-zA-Z0-9_.-]/g, '_');
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && !generatedPaper) {
    return (
      <>
        <TopBar title="Create New" onBack={() => router.push('/')} />
        <div className="page-content">
          <div className="page-loading">
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  const paper = generatedPaper || currentAssignment?.generatedPaper;

  if (!paper) {
    return (
      <>
        <TopBar title="Create New" onBack={() => router.push('/')} />
        <div className="page-content">
          <div className="empty-state">
            <div className="empty-state-title">No paper generated yet</div>
            <p className="empty-state-description">
              This assignment hasn&apos;t been generated yet. Go back and create one.
            </p>
            <button className="empty-state-btn" onClick={() => router.push('/create')}>
              <span style={{ display: 'flex', alignItems: 'center' }}><Sparkles size={16} /></span> Create Assignment
            </button>
          </div>
        </div>
      </>
    );
  }

  const bannerText = `Certainly, ${currentAssignment?.school ? 'here' : 'Lakshya! Here'} are customized Question Paper for your ${currentAssignment?.className || ''} ${currentAssignment?.subject || 'Science'} class:`;

  return (
    <>
      <TopBar title="Create New" onBack={() => router.push('/')} />

      {isGenerating && <GeneratingOverlay progress={generationProgress} />}

      <div className="page-content">
        {/* Dark Banner */}
        <div className="paper-banner">
          <div className="paper-banner-text">{bannerText}</div>
          <div className="paper-banner-actions">
            <button
              className="paper-download-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                  Generating PDF...
                </>
              ) : (
                <>
                  <span style={{ display: 'flex', alignItems: 'center' }}><Download size={16} /></span>
                  Download as PDF
                </>
              )}
            </button>
            <button className="paper-regenerate-btn" onClick={handleRegenerate}>
              <span style={{ display: 'flex', alignItems: 'center' }}><RefreshCw size={16} /></span>
              Regenerate
            </button>
          </div>
        </div>

        {/* Question Paper */}
        <div ref={paperRef}>
          <QuestionPaper paper={paper} />
        </div>
      </div>
    </>
  );
}
