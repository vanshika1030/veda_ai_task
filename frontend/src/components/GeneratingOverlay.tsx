'use client';

import { Brain } from 'lucide-react';

interface GeneratingOverlayProps {
  progress?: number;
}

export default function GeneratingOverlay({ progress = 0 }: GeneratingOverlayProps) {
  return (
    <div className="generating-overlay">
      <div className="generating-card">
        <div className="generating-icon"><Brain size={48} color="var(--primary)" /></div>
        <div className="generating-title">Generating your question paper...</div>
        <div className="generating-subtitle">
          Our AI is crafting thoughtful questions tailored to your specifications.
          This may take a moment.
        </div>
        <div className="generating-progress">
          <div
            className="generating-progress-bar"
            style={{ width: `${Math.max(progress, 15)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
