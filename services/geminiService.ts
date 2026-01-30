
import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization using environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAssistantResponse = async (query: string) => {
  if (!process.env.API_KEY) {
    return "দুঃখিত, এআই সার্ভিস কনফিগার করা হয়নি। দয়া করে অ্যাডমিন প্যানেলে চেক করুন।";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert sales assistant for "ABS Library & Computer". 
      Location: Dhaka, Bangladesh.
      We sell: Books, Stationery, Computer accessories.
      We provide: Computer repair, Windows setup, Hardware servicing.
      User query: ${query}
      Response language: Bengali (বাংলা).
      Provide a helpful, concise, and friendly response.`,
      config: {
        // Removed maxOutputTokens to prevent potential truncation without thinkingBudget
        temperature: 0.7,
      }
    });
    // The response.text property directly returns the string output.
    return response.text || "আমি দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("AI Error:", error);
    return "আমি এই মুহূর্তে সংযোগ করতে পারছি না। দয়া করে সরাসরি আমাদের ফোন নম্বরে যোগাযোগ করুন।";
  }
};

export const getProductRecommendations = async (interests: string) => {
  if (!process.env.API_KEY) return [];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 categories or items for a user interested in: ${interests}. Return JSON array in Bengali.`,
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
            propertyOrdering: ["suggestion", "reason"],
            required: ["suggestion", "reason"]
          }
        }
      }
    });
    // Trim and parse the JSON response text
    let jsonStr = response.text?.trim();
    return JSON.parse(jsonStr || "[]");
  } catch (error) {
    console.error("AI Recommendations Error:", error);
    return [];
  }
};
