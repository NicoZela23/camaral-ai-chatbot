import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiConfig = {
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  generationConfig: {
    temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
    topP: parseFloat(process.env.LLM_TOP_P || "0.95"),
    topK: 40,
    maxOutputTokens: parseInt(process.env.LLM_MAX_TOKENS || "1024", 10),
  },
  
  systemInstruction:
    "Responde SIEMPRE en español. Nunca mezcles idiomas. Todas tus respuestas deben estar completamente en español.",
};

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: geminiConfig.model,
    generationConfig: geminiConfig.generationConfig,
    systemInstruction: geminiConfig.systemInstruction,
  });
}
