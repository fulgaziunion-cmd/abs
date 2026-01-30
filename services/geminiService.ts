
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAIAssistantResponse = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert sales assistant for "ABS Library & Computer". We sell books, stationery, and computer parts.
      User query: ${query}
      Provide a helpful, concise response. If they ask about repairs, suggest our "Computer Services" section.`,
      config: {
        maxOutputTokens: 200,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain. How can I help you manually?";
  }
};

export const getProductRecommendations = async (interests: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 categories or items for a user interested in: ${interests}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              suggestion: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["suggestion", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
