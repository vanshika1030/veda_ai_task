import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAssignment, GeneratedPaper, Question, Section } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Models to try in order of preference
const MODELS_TO_TRY = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
];

function buildPrompt(assignment: IAssignment): string {
  const questionTypesStr = assignment.questionTypes
    .map((qt) => `- ${qt.count} ${qt.type} questions, ${qt.marks} marks each (total: ${qt.count * qt.marks} marks)`)
    .join('\n');

  const totalMarks = assignment.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  return `You are an expert teacher creating a formal question paper. Generate a structured question paper with the following specifications:

School: ${assignment.school}
Subject: ${assignment.subject}
Class: ${assignment.className}
Time Allowed: ${assignment.timeAllowed} minutes
Total Marks: ${totalMarks}

Question Types Required:
${questionTypesStr}

${assignment.additionalInstructions ? `Additional Instructions: ${assignment.additionalInstructions}` : ''}

RULES:
1. Group questions into sections (Section A, Section B, etc.) based on question type.
2. Each section should have a clear title, the question type as the section type, and an instruction line.
3. Each question MUST have a difficulty level: "Easy", "Moderate", or "Hard" — use a realistic mix.
4. Questions should be academically appropriate for the specified class level.
5. Number questions sequentially within each section starting from 1.
6. Make questions creative, clear, and well-structured.

RESPOND WITH ONLY VALID JSON in this EXACT format (no markdown, no explanation, just JSON):
{
  "schoolName": "${assignment.school}",
  "subject": "${assignment.subject}",
  "className": "${assignment.className}",
  "timeAllowed": "${assignment.timeAllowed} minutes",
  "maxMarks": ${totalMarks},
  "generalInstruction": "All questions are compulsory unless stated otherwise.",
  "studentInfo": {
    "name": "",
    "rollNumber": "",
    "classSection": "${assignment.className}"
  },
  "sections": [
    {
      "title": "Section A",
      "type": "Question Type Name",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 2
        }
      ]
    }
  ]
}`;
}

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }
  return text.trim();
}

function validatePaper(paper: any): paper is GeneratedPaper {
  return (
    paper &&
    typeof paper.schoolName === 'string' &&
    typeof paper.subject === 'string' &&
    typeof paper.className === 'string' &&
    typeof paper.timeAllowed === 'string' &&
    typeof paper.maxMarks === 'number' &&
    Array.isArray(paper.sections) &&
    paper.sections.length > 0 &&
    paper.sections.every(
      (s: any) =>
        s.title &&
        s.type &&
        Array.isArray(s.questions) &&
        s.questions.every(
          (q: any) =>
            typeof q.questionNumber === 'number' &&
            typeof q.text === 'string' &&
            ['Easy', 'Moderate', 'Hard'].includes(q.difficulty) &&
            typeof q.marks === 'number'
        )
    )
  );
}

// ===== QUESTION BANK FOR FALLBACK =====
const QUESTION_BANK: Record<string, Record<string, string[]>> = {
  'Multiple Choice Questions': {
    Science: [
      'Which of the following is NOT a renewable source of energy? (a) Solar (b) Wind (c) Coal (d) Hydro',
      'The SI unit of electric current is: (a) Volt (b) Ampere (c) Ohm (d) Watt',
      'Which organelle is known as the powerhouse of the cell? (a) Nucleus (b) Ribosome (c) Mitochondria (d) Golgi body',
      'What is the chemical formula of water? (a) H₂O (b) CO₂ (c) NaCl (d) O₂',
      'The process of converting sugar into alcohol using yeast is called: (a) Pasteurization (b) Fermentation (c) Oxidation (d) Reduction',
      'Which planet is known as the Red Planet? (a) Venus (b) Mars (c) Jupiter (d) Saturn',
      'What is the boiling point of water at standard pressure? (a) 50°C (b) 100°C (c) 150°C (d) 200°C',
      'Which gas is most abundant in the Earth\'s atmosphere? (a) Oxygen (b) Carbon dioxide (c) Nitrogen (d) Argon',
    ],
    Mathematics: [
      'What is the value of π (pi) correct to two decimal places? (a) 3.12 (b) 3.14 (c) 3.16 (d) 3.18',
      'The sum of angles in a triangle is: (a) 90° (b) 180° (c) 270° (d) 360°',
      'What is 15% of 200? (a) 20 (b) 25 (c) 30 (d) 35',
      'The HCF of 12 and 18 is: (a) 2 (b) 4 (c) 6 (d) 8',
      'If x + 5 = 12, then x = ? (a) 5 (b) 6 (c) 7 (d) 8',
      'Which of the following is a prime number? (a) 15 (b) 21 (c) 23 (d) 25',
      'The area of a circle with radius 7 cm is: (a) 44 cm² (b) 154 cm² (c) 22 cm² (d) 308 cm²',
      'What is the square root of 144? (a) 10 (b) 11 (c) 12 (d) 13',
    ],
    default: [
      'Which of the following statements is correct regarding the given topic? (a) Option A (b) Option B (c) Option C (d) Option D',
      'Identify the correct definition from the choices below: (a) Option A (b) Option B (c) Option C (d) Option D',
      'What is the primary characteristic described in this chapter? (a) Option A (b) Option B (c) Option C (d) Option D',
      'Which example best demonstrates the concept discussed? (a) Example A (b) Example B (c) Example C (d) Example D',
      'Select the most appropriate answer: (a) Option A (b) Option B (c) Option C (d) Option D',
      'The correct sequence is: (a) A-B-C-D (b) B-C-D-A (c) C-D-A-B (d) D-A-B-C',
      'Which one is NOT related to the topic? (a) Option A (b) Option B (c) Option C (d) Option D',
      'Choose the right match: (a) A-1 (b) B-2 (c) C-3 (d) All of the above',
    ],
  },
  'Short Questions': {
    Science: [
      'Define electroplating. Explain its purpose.',
      'What is the role of a conductor in the process of electrolysis?',
      'Why does a solution of copper sulfate conduct electricity?',
      'Explain the difference between a physical change and a chemical change with one example each.',
      'What is photosynthesis? Write the balanced chemical equation.',
      'Describe the function of stomata in leaves.',
      'What is an ecosystem? Name its two main components.',
      'Explain Newton\'s third law of motion with an example.',
    ],
    Mathematics: [
      'Find the LCM of 24 and 36.',
      'Solve: 3x - 7 = 14.',
      'What is the difference between simple interest and compound interest?',
      'Find the perimeter of a rectangle with length 12 cm and width 8 cm.',
      'Express 0.375 as a fraction in its simplest form.',
      'Define a quadrilateral. Name four types of quadrilaterals.',
      'Calculate the mean of: 5, 8, 12, 15, 20.',
      'If the ratio of two numbers is 3:5 and their sum is 64, find the numbers.',
    ],
    default: [
      'Define the key concept discussed in this unit and provide an example.',
      'Explain the significance of the topic in everyday life.',
      'Compare and contrast the two main ideas presented in this chapter.',
      'What are the three main features of the concept? Explain briefly.',
      'Describe the process step by step.',
      'Why is this topic important in the modern context? Give two reasons.',
      'List and explain any three characteristics discussed in this lesson.',
      'State the main principle and give a real-world application.',
    ],
  },
  'Long Questions': {
    default: [
      'Discuss in detail the main concepts covered in this chapter. Provide suitable examples and diagrams where necessary.',
      'Explain the process described in this unit with a well-labeled diagram. What are its real-world applications?',
      'Compare and contrast the two major theories discussed. Which one do you find more relevant and why?',
      'Describe the historical development of this concept. How has it evolved over time?',
      'Analyze the given case study and answer the questions that follow, providing detailed explanations.',
      'Write a detailed essay on the importance of this topic in modern society. Include at least three supporting arguments.',
    ],
  },
  'Diagram/Graph-Based Questions': {
    default: [
      'Draw a well-labeled diagram illustrating the concept discussed in this chapter. Explain each labeled part.',
      'Study the given data and plot a suitable graph. Interpret the trend shown by the graph.',
      'Draw a flowchart showing the step-by-step process described in this unit.',
      'Label the given diagram and explain the function of each part.',
      'Create a pie chart based on the following data and answer the questions below.',
      'Draw a neat diagram and explain the working principle described in this lesson.',
    ],
  },
  'Numerical Problems': {
    default: [
      'A car travels 150 km in 3 hours. Calculate its average speed. If it then travels at 60 km/h for 2 more hours, what is the total distance covered?',
      'Calculate the total resistance when three resistors of 4Ω, 6Ω, and 12Ω are connected in parallel.',
      'A shopkeeper buys an article for ₹500 and sells it for ₹650. Calculate the profit percentage.',
      'Find the compound interest on ₹10,000 at 8% per annum for 2 years, compounded annually.',
      'A rectangular tank is 5m long, 3m wide, and 2m deep. Calculate the volume of water it can hold in liters.',
      'If the force applied on an object of mass 5 kg produces an acceleration of 3 m/s², calculate the force. What will be the acceleration if the same force is applied to a 10 kg object?',
    ],
  },
  'True/False': {
    default: [
      'The Earth revolves around the Sun in approximately 365 days.',
      'Sound travels faster in vacuum than in air.',
      'The chemical formula of common salt is NaCl.',
      'Photosynthesis occurs in the mitochondria of plant cells.',
      'The square root of a negative number is a real number.',
      'Water is a universal solvent.',
      'All metals are good conductors of electricity.',
      'The human body has 206 bones.',
    ],
  },
  'Fill in the Blanks': {
    default: [
      'The process by which plants make food using sunlight is called ____________.',
      'The SI unit of force is ____________.',
      'The chemical symbol for gold is ____________.',
      'The largest planet in our solar system is ____________.',
      'The value of gravitational acceleration on Earth is approximately ____________ m/s².',
      'Blood is filtered by the ____________ in the human body.',
      'The sum of all interior angles of a hexagon is ____________ degrees.',
      'The freezing point of water is ____________ °C.',
    ],
  },
};

function generateFallbackPaper(assignment: IAssignment): GeneratedPaper {
  console.log('Using fallback question generator...');
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const difficulties: Array<'Easy' | 'Moderate' | 'Hard'> = ['Easy', 'Moderate', 'Hard'];
  const totalMarks = assignment.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  const sections: Section[] = assignment.questionTypes.map((qt, sIndex) => {
    // Get question bank for this type
    const typeBank = QUESTION_BANK[qt.type] || QUESTION_BANK['Short Questions'];
    const subjectQuestions = typeBank[assignment.subject] || typeBank['default'] || typeBank[Object.keys(typeBank)[0]];

    const questions: Question[] = [];
    for (let i = 0; i < qt.count; i++) {
      // Cycle through available questions, distribute difficulties
      const difficultyIndex = i < qt.count * 0.4 ? 0 : i < qt.count * 0.7 ? 1 : 2;
      questions.push({
        questionNumber: i + 1,
        text: subjectQuestions[i % subjectQuestions.length],
        difficulty: difficulties[difficultyIndex],
        marks: qt.marks,
      });
    }

    return {
      title: `Section ${sectionLetters[sIndex] || String(sIndex + 1)}`,
      type: qt.type,
      instruction: `Attempt all questions. Each question carries ${qt.marks} mark${qt.marks > 1 ? 's' : ''}`,
      questions,
    };
  });

  return {
    schoolName: assignment.school,
    subject: assignment.subject,
    className: assignment.className,
    timeAllowed: `${assignment.timeAllowed} minutes`,
    maxMarks: totalMarks,
    generalInstruction: 'All questions are compulsory unless stated otherwise.',
    studentInfo: {
      name: '',
      rollNumber: '',
      classSection: assignment.className,
    },
    sections,
  };
}

export async function generateQuestionPaper(assignment: IAssignment): Promise<GeneratedPaper> {
  const prompt = buildPrompt(assignment);

  // Try each model in sequence
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(`${modelName} response length: ${text.length}`);

      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);

      if (!validatePaper(parsed)) {
        throw new Error('Generated paper does not match expected structure');
      }

      parsed.sections = parsed.sections.map((section: any) => ({
        ...section,
        instruction: section.instruction || `Attempt all questions. Each question carries ${section.questions[0]?.marks || 1} marks`,
      }));

      if (!parsed.studentInfo) {
        parsed.studentInfo = {
          name: '',
          rollNumber: '',
          classSection: assignment.className,
        };
      }

      if (!parsed.generalInstruction) {
        parsed.generalInstruction = 'All questions are compulsory unless stated otherwise.';
      }

      console.log(`Question paper generated successfully with ${modelName} — ${parsed.sections.length} sections`);
      return parsed as GeneratedPaper;
    } catch (error: any) {
      console.warn(`${modelName} failed: ${error.message}`);
      // Continue to next model
    }
  }

  // All models failed — use fallback
  console.log('All Gemini models failed. Using intelligent fallback generator.');
  return generateFallbackPaper(assignment);
}
