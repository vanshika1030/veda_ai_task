export interface QuestionType {
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

export interface IAssignment {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress?: number;
  result?: GeneratedPaper;
  error?: string;
}
