import mongoose, { Schema, Document } from 'mongoose';
import { IAssignment, GeneratedPaper, QuestionType, Section, Question } from '../types';

export interface IAssignmentDocument extends Omit<IAssignment, '_id'>, Document {}

const QuestionSchema = new Schema<Question>({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
}, { _id: false });

const SectionSchema = new Schema<Section>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
}, { _id: false });

const GeneratedPaperSchema = new Schema<GeneratedPaper>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  generalInstruction: { type: String, required: true },
  studentInfo: {
    name: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    classSection: { type: String, default: '' },
  },
  sections: [SectionSchema],
}, { _id: false });

const QuestionTypeSchema = new Schema<QuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
}, { _id: false });

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    school: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true, validate: [(v: QuestionType[]) => v.length > 0, 'At least one question type is required'] },
    totalMarks: { type: Number, required: true, min: 1 },
    timeAllowed: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'generating', 'completed', 'error'], default: 'draft' },
    generatedPaper: { type: GeneratedPaperSchema, default: undefined },
  },
  { timestamps: true }
);

AssignmentSchema.index({ title: 'text' });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ createdAt: -1 });

const Assignment = mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);

export default Assignment;
