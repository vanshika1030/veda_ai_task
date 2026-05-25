export interface QuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  questionNumber: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface Section {
  title: string;
  type: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstruction: string;
  studentInfo: {
    name: string;
    rollNumber: string;
    classSection: string;
  };
  sections: Section[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  school: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  timeAllowed: number;
  additionalInstructions?: string;
  fileUrl?: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  generatedPaper?: GeneratedPaper;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  school: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  timeAllowed: number;
  additionalInstructions: string;
  file?: File | null;
}

export type NavItem = 'home' | 'groups' | 'assignments' | 'toolkit' | 'library';
