
import { GoogleGenAI } from "@google/genai";
import { Article } from '../types';
import { getRandomPlaceholder } from '../utils/placeholders';

// This function now uses Gemini Search Grounding to find UAP reports instead of RSS scraping
export const fetchNews = async (apiKey: string): Promise<Article[]> => {
  if (!apiKey) {
    throw new Error("Clearance code missing. Please authenticate with valid API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Using gemini-3-flash-preview for better search tool integration
  const model = "gemini-3-flash-preview"; 
  
  const prompt = `
    Perform a Google Search to find the most significant UAP (Unidentified Anomalous Phenomena) and UFO news, sightings, and government reports from the last 48 hours.
    
    Prioritize the following sources:
    1. MUFON and NUFORC
    2. The Debrief
    3. AARO.mil
    4. Official Pentagon report filings, legal updates, and protocols regarding UAP disclosure.
    
    Return a comprehensive list of up to 99 distinct news items. Try to find as many relevant recent reports as possible.
    
    Return a STRICT JSON array of objects. Do not include markdown formatting or code blocks.
    Each object must have the following fields:
    - title: string
    - source: string
    - url: string
    - description: string (a brief summary of the report)
    
    Ensure the output is a valid JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseSchema and responseMimeType removed to avoid conflict with Search Grounding
      }
    });

    let jsonText = response.text;
    if (!jsonText) return [];

    // Robustly clean markdown code blocks if the model includes them
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
        data = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("Malformed intelligence data received.");
    }

    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item: any, index: number) => ({
      id: `uap-intel-${Date.now()}-${index}`,
      title: item.title,
      url: item.url,
      source: item.source || "Classified Source",
      description: item.description,
      thumbnail: getRandomPlaceholder() 
    }));

  } catch (error) {
    console.error("Gemini Search Operation Failed:", error);
    throw new Error("Unable to establish link with Intelligence Grid.");
  }
};
