'use client';

import { GeneratedPaper } from '@/types';

interface QuestionPaperProps {
  paper: GeneratedPaper;
}

export default function QuestionPaper({ paper }: QuestionPaperProps) {
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="paper-sheet" id="question-paper">
      {/* School Header */}
      <div className="paper-school-name">{paper.schoolName}</div>
      <div className="paper-meta-center">
        <strong>Subject: {paper.subject}</strong>
      </div>
      <div className="paper-meta-center">
        <strong>Class: {paper.className}</strong>
      </div>

      {/* Time and Marks Row */}
      <div className="paper-meta-row">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.maxMarks}</span>
      </div>

      {/* General Instruction */}
      <div className="paper-instruction">{paper.generalInstruction}</div>

      {/* Student Info */}
      <div className="paper-student-info">
        <div className="paper-student-info-line">
          <strong>Name:</strong>
          <span className="line" />
        </div>
        <div className="paper-student-info-line">
          <strong>Roll Number:</strong>
          <span className="line" />
        </div>
        <div className="paper-student-info-line">
          <strong>Class: {paper.className} Section:</strong>
          <span className="line" />
        </div>
      </div>

      <div className="paper-divider" />

      {/* Sections */}
      {paper.sections.map((section, sIndex) => (
        <div key={sIndex} className="paper-section">
          <div className="paper-section-title">
            Section {sectionLetters[sIndex] || sIndex + 1}
          </div>
          <div className="paper-section-type">{section.type}</div>
          <div className="paper-section-instruction">{section.instruction}</div>

          {section.questions.map((question, qIndex) => (
            <div key={qIndex} className="paper-question">
              <span className="paper-question-number">{question.questionNumber}.</span>
              <span className="paper-question-text">
                <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                  {question.difficulty}
                </span>
                {' '}{question.text}
              </span>
              <span className="paper-question-meta">
                <span className="paper-question-marks">[{question.marks} Marks]</span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
