'use client';

import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document */}
          <rect x="50" y="30" width="80" height="110" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2"/>
          <line x1="70" y1="55" x2="110" y2="55" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
          <line x1="70" y1="70" x2="100" y2="70" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          <line x1="70" y1="82" x2="105" y2="82" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          <line x1="70" y1="94" x2="95" y2="94" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          <line x1="70" y1="106" x2="110" y2="106" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          {/* Pen/pencil */}
          <line x1="45" y1="35" x2="55" y2="25" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          <path d="M42 38 L48 32 L52 36 L46 42 Z" fill="#9CA3AF"/>
          {/* Magnifying glass circle */}
          <circle cx="130" cy="120" r="32" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2"/>
          <circle cx="130" cy="120" r="24" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
          {/* X inside magnifying glass */}
          <line x1="120" y1="110" x2="140" y2="130" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <line x1="140" y1="110" x2="120" y2="130" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          {/* Magnifying glass handle */}
          <line x1="150" y1="142" x2="162" y2="154" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
          {/* Decorative dots */}
          <circle cx="160" cy="60" r="3" fill="#E8613A" opacity="0.3"/>
          <circle cx="35" cy="100" r="2" fill="#3B82F6" opacity="0.3"/>
          {/* Small sparkle */}
          <path d="M170 90 L172 85 L174 90 L179 92 L174 94 L172 99 L170 94 L165 92 Z" fill="#E8613A" opacity="0.2"/>
        </svg>
      </div>
      <h2 className="empty-state-title">No assignments yet</h2>
      <p className="empty-state-description">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <button className="empty-state-btn" onClick={onCreateClick}>
        <span style={{ display: 'flex', alignItems: 'center' }}><Sparkles size={16} /></span>
        Create Your First Assignment
      </button>
    </div>
  );
}
