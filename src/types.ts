import { Type } from "@google/genai";

export interface Flashcard {
  question: string;
  answer: string;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyData {
  flashcards: Flashcard[];
  exam: ExamQuestion[];
  comprehensiveExplanation: string;
  simpleExplanation: string;
}

export const StudyDataSchema = {
  type: Type.OBJECT,
  properties: {
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
    exam: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
      },
    },
    comprehensiveExplanation: { 
      type: Type.STRING,
      description: "A detailed, structured explanation of the study materials provided in the images."
    },
    simpleExplanation: { 
      type: Type.STRING,
      description: "A simplified version of the explanation, using easy-to-understand language for complex topics."
    },
  },
  required: ["flashcards", "exam", "comprehensiveExplanation", "simpleExplanation"],
};
