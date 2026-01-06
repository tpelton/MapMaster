
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

/**
 * Service to handle floorplan analysis using Gemini Vision.
 * Using gemini-2.0-flash-exp (or updated model)
 */
export const parseMapWithGemini = async (
  base64Data: string,
  mimeType: string
): Promise<string[]> => {
  // Check all possible env var locations
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: No API Key found. Please set VITE_GEMINI_API_KEY in your .env file.");
    throw new Error("Missing API Key. Check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert low-voltage estimator. Your goal is to identify EVERY SINGLE device tag on this floorplan.
    
    CRITICAL INSTRUCTION: Scan the entire image exhaustively. Return ONLY a JSON array of strings containing the label IDs found.
    
    Examples of IDs to look for:
    - "D101", "D102"
    - "SP01", "S1"
    - "TV1", "DISP2"
    - "AP05", "WAP1"
    - "C1", "CAM-01"
    - "KP1"
    - "TS01"
    
    Do NOT attempt to categorize them. Just return the raw text ID found.
    
    Example Output:
    ["D101", "D102", "SP01", "TV1", "AP05"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};
