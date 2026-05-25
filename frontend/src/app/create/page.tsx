'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Sparkles } from 'lucide-react';
import TopBar from '@/components/TopBar';
import FileUpload from '@/components/FileUpload';
import QuestionTypeRow from '@/components/QuestionTypeRow';
import GeneratingOverlay from '@/components/GeneratingOverlay';
import { useAssignmentStore } from '@/store/assignmentStore';
import { wsClient } from '@/lib/websocket';
import { QuestionType } from '@/types';

// Simple ID generator
let idCounter = 0;
const genId = () => `qt-${Date.now()}-${++idCounter}`;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    isGenerating,
    generationProgress,
    error,
    createAssignment,
    triggerGeneration,
    setGeneratedPaper,
    setGenerationProgress,
    setIsGenerating,
    clearError,
  } = useAssignmentStore();

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [school, setSchool] = useState('Delhi Public School, Sector-4, Bokaro');
  const [dueDate, setDueDate] = useState('');
  const [timeAllowed, setTimeAllowed] = useState(45);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { id: genId(), type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: genId(), type: 'Short Questions', count: 3, marks: 2 },
  ]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WebSocket setup
  useEffect(() => {
    wsClient.connect();

    const unsubProgress = wsClient.on('generation:progress', (data: any) => {
      setGenerationProgress(data.progress || 0);
    });

    const unsubComplete = wsClient.on('generation:completed', (data: any) => {
      setGeneratedPaper(data.paper);
      setIsGenerating(false);
      router.push(`/paper/${data.assignmentId}`);
    });

    const unsubError = wsClient.on('generation:error', (data: any) => {
      setIsGenerating(false);
      alert(`Generation failed: ${data.error}. Please try again.`);
    });

    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
    };
  }, [router, setGeneratedPaper, setGenerationProgress, setIsGenerating]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!className.trim()) newErrors.className = 'Class is required';
    if (!school.trim()) newErrors.school = 'School name is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (questionTypes.length === 0) newErrors.questionTypes = 'At least one question type is required';
    if (timeAllowed < 1) newErrors.timeAllowed = 'Time must be at least 1 minute';

    for (const qt of questionTypes) {
      if (qt.count < 1 || qt.marks < 1) {
        newErrors.questionTypes = 'Questions and marks must be at least 1';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

      const assignment = await createAssignment({
        title,
        subject,
        className,
        school,
        dueDate,
        questionTypes: questionTypes.map(({ type, count, marks }) => ({ type, count, marks })),
        totalMarks,
        timeAllowed,
        additionalInstructions,
      });

      // Trigger generation
      await triggerGeneration(assignment._id);

      // Wait for WebSocket completion — polling fallback
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/assignments/${assignment._id}`);
          const data = await res.json();
          if (data.status === 'completed' && data.generatedPaper) {
            clearInterval(pollInterval);
            setGeneratedPaper(data.generatedPaper);
            setIsGenerating(false);
            router.push(`/paper/${assignment._id}`);
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert('Generation failed. Please try again.');
          }
        } catch {
          // Ignore polling errors
        }
      }, 3000);

      // Clear polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (err: any) {
      setIsGenerating(false);
      setIsSubmitting(false);
      alert(`Error: ${err.message}`);
    }
  };

  const addQuestionType = () => {
    setQuestionTypes([
      ...questionTypes,
      { id: genId(), type: 'Multiple Choice Questions', count: 5, marks: 1 },
    ]);
  };

  const updateQuestionType = (index: number, updated: QuestionType) => {
    const newTypes = [...questionTypes];
    newTypes[index] = updated;
    setQuestionTypes(newTypes);
  };

  const removeQuestionType = (index: number) => {
    if (questionTypes.length <= 1) return;
    setQuestionTypes(questionTypes.filter((_, i) => i !== index));
  };

  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const progressPercent = [title, subject, className, school, dueDate].filter(Boolean).length * 15 + (questionTypes.length > 0 ? 25 : 0);

  return (
    <>
      <TopBar title="Assignment" onBack={() => router.push('/')} />

      {isGenerating && <GeneratingOverlay progress={generationProgress} />}

      <div className="page-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-row">
            <div className="page-status-dot" />
            <h1 className="page-title">Create Assignment</h1>
          </div>
          <p className="page-subtitle">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">Assignment Details</div>
            <div className="form-section-subtitle">Basic information about your assignment</div>

            {/* Title & Subject */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Quiz on Electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && <div className="form-error">{errors.subject}</div>}
              </div>
            </div>

            {/* Class & School */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Class</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 8th"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
                {errors.className && <div className="form-error">{errors.className}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Delhi Public School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
                {errors.school && <div className="form-error">{errors.school}</div>}
              </div>
            </div>

            {/* File Upload */}
            <FileUpload
              file={file}
              onFileSelect={setFile}
              onFileRemove={() => setFile(null)}
            />

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div className="form-input-with-icon">
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                />
                <span className="form-input-icon"><Calendar size={18} /></span>
              </div>
              {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
            </div>

            {/* Question Types */}
            <div className="form-group">
              <div className="question-types-header">
                <span>Question Type</span>
                <span></span>
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>

              {questionTypes.map((qt, index) => (
                <QuestionTypeRow
                  key={qt.id}
                  questionType={qt}
                  onUpdate={(updated) => updateQuestionType(index, updated)}
                  onRemove={() => removeQuestionType(index)}
                />
              ))}

              {errors.questionTypes && <div className="form-error">{errors.questionTypes}</div>}

              <button type="button" className="add-question-type-btn" onClick={addQuestionType}>
                <span style={{ display: 'flex', alignItems: 'center' }}><Plus size={16} /></span> Add Question Type
              </button>
            </div>

            {/* Time Allowed */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Time Allowed (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(parseInt(e.target.value) || 0)}
                  min={1}
                />
                {errors.timeAllowed && <div className="form-error">{errors.timeAllowed}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <div style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {totalQuestions} questions · {totalMarks} total marks
                </div>
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="form-group">
              <label className="form-label">Additional Instructions (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Any specific instructions for the AI to follow..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isSubmitting || isGenerating}>
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Generating...
              </>
            ) : (
              <>
                <span style={{ display: 'flex', alignItems: 'center' }}><Sparkles size={16} /></span>
                Generate Question Paper
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
