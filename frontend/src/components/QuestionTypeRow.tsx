'use client';

import { QuestionType } from '@/types';
import { ChevronDown, X, Minus, Plus } from 'lucide-react';

interface QuestionTypeRowProps {
  questionType: QuestionType;
  onUpdate: (updated: QuestionType) => void;
  onRemove: () => void;
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False',
  'Fill in the Blanks',
];

export default function QuestionTypeRow({ questionType, onUpdate, onRemove }: QuestionTypeRowProps) {
  const updateCount = (delta: number) => {
    const newCount = Math.max(1, questionType.count + delta);
    onUpdate({ ...questionType, count: newCount });
  };

  const updateMarks = (delta: number) => {
    const newMarks = Math.max(1, questionType.marks + delta);
    onUpdate({ ...questionType, marks: newMarks });
  };

  return (
    <div className="question-type-row">
      <div className="question-type-select-wrapper">
        <select
          className="question-type-select"
          value={questionType.type}
          onChange={(e) => onUpdate({ ...questionType, type: e.target.value })}
        >
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="question-type-select-arrow"><ChevronDown size={14} /></span>
      </div>

      <button type="button" className="question-type-remove" onClick={onRemove} aria-label="Remove question type">
        <X size={14} />
      </button>

      {/* No. of Questions Stepper */}
      <div className="stepper">
        <button type="button" className="stepper-btn" onClick={() => updateCount(-1)} aria-label="Decrease count"><Minus size={14} /></button>
        <span className="stepper-value">{questionType.count}</span>
        <button type="button" className="stepper-btn" onClick={() => updateCount(1)} aria-label="Increase count"><Plus size={14} /></button>
      </div>

      {/* Marks Stepper */}
      <div className="stepper">
        <button type="button" className="stepper-btn" onClick={() => updateMarks(-1)} aria-label="Decrease marks"><Minus size={14} /></button>
        <span className="stepper-value">{questionType.marks}</span>
        <button type="button" className="stepper-btn" onClick={() => updateMarks(1)} aria-label="Increase marks"><Plus size={14} /></button>
      </div>
    </div>
  );
}
