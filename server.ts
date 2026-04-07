import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the schema directly or redefine it to avoid issues with ESM/CJS
const StudyDataSchema = {
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/generate", async (req, res) => {
    const { subject, photos, lang } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const imageParts = photos.map((photo: string) => {
        const parts = photo.split(',');
        const base64Data = parts[1];
        const mimeType = parts[0].split(':')[1].split(';')[0] || "image/jpeg";
        
        return {
          inlineData: {
            data: base64Data,
            mimeType
          }
        };
      });

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: `You are an expert tutor. I am providing ${imageParts.length} images of study material for the subject: ${subject}. 
              
              Please follow these instructions carefully:
              1. Synthesize information from ALL provided images to create a comprehensive study guide.
              2. Generate the response in the following language: ${lang === 'ar' ? 'Arabic' : 'English'}.
              3. Generate a 'comprehensiveExplanation' which is a detailed, structured explanation of all the materials. Use Markdown for formatting (headings, lists, bold text).
              4. Generate a 'simpleExplanation' which is a simplified version of the same content, using very easy-to-understand language, analogies, and shorter sentences to make the subject easier to grasp.
              5. Generate exactly 10 high-quality flashcards that cover the most important concepts across all images.
              6. Generate exactly 10 multiple-choice questions for an exam. Each question must have 4 options, one correct answer, and a detailed explanation of why that answer is correct based on the notes.
              7. Ensure the questions vary in difficulty and cover different topics found in the images.
              8. Return the result strictly in the specified JSON format.` },
              ...imageParts
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: StudyDataSchema as any,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      if (!response.text) {
        throw new Error("AI returned empty response");
      }

      const data = JSON.parse(response.text);
      res.json(data);
    } catch (error: any) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate study materials." });
    }
  });

  app.post("/api/explain-mistakes", async (req, res) => {
    const { studyData, mistakes, userAnswers, lang } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Based on the following study material and the mistakes I made in the exam, please provide a friendly and encouraging explanation of why these answers were wrong and what the correct concepts are.
      
      Study Material: ${studyData.comprehensiveExplanation}
      
      Mistakes:
      ${mistakes.map((m: any) => `Question: ${m.question}\nMy Answer: ${userAnswers[studyData.exam.indexOf(m)]}\nCorrect Answer: ${m.correctAnswer}\nExplanation: ${m.explanation}`).join('\n\n')}
      
      Please respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      res.json({ text: response.text || "Could not generate explanation." });
    } catch (error: any) {
      console.error("AI Explanation error:", error);
      res.status(500).json({ error: error.message || "Failed to explain mistakes." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
