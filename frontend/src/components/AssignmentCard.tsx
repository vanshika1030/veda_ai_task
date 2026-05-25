'use client';

import { useState, useRef, useEffect } from 'react';
import { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onView, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="assignment-card" ref={menuRef}>
      <div className="assignment-card-header">
        <div className="assignment-card-title">{assignment.title}</div>
        <button
          className="assignment-card-menu-btn"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>

      <div className="assignment-card-dates">
        <span className="assignment-card-date">
          <strong>Assigned on</strong> : {formatDate(assignment.createdAt)}
        </span>
        {assignment.dueDate && (
          <span className="assignment-card-date">
            <strong>Due</strong> : {formatDate(assignment.dueDate)}
          </span>
        )}
      </div>

      {menuOpen && (
        <div className="card-menu">
          <button
            className="card-menu-item"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onView(assignment._id); }}
          >
            View Assignment
          </button>
          <button
            className="card-menu-item danger"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(assignment._id); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
