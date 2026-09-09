
import { GoogleGenAI, Modality } from "@google/genai";
import { EnhancedContent, ReporterStyle, VoiceID } from '../types';

export const generateIntelBriefing = async (apiKey: string, title: string, description: string, source: string, style: ReporterStyle): Promise<string> => {
  if (!apiKey) throw new Error("Authentication missing.");
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an undercover UAP Intelligence Officer attached to the "Nexus" monitoring station.
    
    SUBJECT INTELLIGENCE:
    Title: "${title}"
    Source: "${source}"
    Intel Summary: "${description}"
    
    Directives:
    Generate a briefing dossier / blog post about this event.
    Use the Intel Summary as the factual basis for the report, but expand on it creatively according to the chosen persona.
    
    Adopt the following Persona strictly:
    ${getPersonaDescription(style)}
    
    Format:
    - No JSON.
    - Plain text with Markdown formatting.
    - Length: Approximately 250-300 words.
    - Start directly with the content.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text || "Encryption Error: Data packet corrupted.";

  } catch (error) {
    console.error("Intel Generation Failed:", error);
    throw new Error("Failed to decrypt intelligence report.");
  }
};

export const generateVisualReconstruction = async (apiKey: string, title: string, description: string): Promise<string> => {
  if (!apiKey) throw new Error("Authentication missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a high-detail reconnaissance image for the following UAP intelligence report:
    "${title}"
    Detail: "${description}"

    VISUAL STYLE:
    - The image should look like a declassified satellite capture, a thermal FLIR scan, or high-altitude surveillance footage.
    - Use monochromatic or desaturated colors (greens, grays, or deep blues).
    - Include technical HUD overlays, grain, and sensor artifacts.
    - The focus should be on the anomaly described in the report.
    - Photorealistic but appearing as raw surveillance data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No imagery found in data packet.");
  } catch (error) {
    console.error("Image Generation Failed:", error);
    throw new Error("Imagery module offline.");
  }
};

export const generateAudioBriefing = async (apiKey: string, text: string, voiceId: VoiceID): Promise<string> => {
  if (!apiKey) throw new Error("Authentication missing.");

  const ai = new GoogleGenAI({ apiKey });

  // We trim the text slightly to ensure rapid processing for the demo
  const cleanText = text.replace(/[*#]/g, ''); 
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceId },
            },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
        throw new Error("No audio data received from satellite uplink.");
    }
    return audioData;

  } catch (error) {
    console.error("Audio Synthesis Failed:", error);
    throw new Error("Voice synthesis module offline.");
  }
};

function getPersonaDescription(style: ReporterStyle): string {
    switch(style) {
        case 'Academic': return "Academic: Maintain a formal, rigorous tone. Cite data. Avoid speculation. Use scientific terminology regarding atmospheric physics and anomalies.";
        case 'Gonzo': return "Gonzo: High energy, slightly paranoid, first-person perspective. Think Hunter S. Thompson investigating Area 51. Use colorful metaphors and question the nature of reality.";
        case 'Skeptic': return "Skeptic: Critical, debunking tone. Look for prosaic explanations (drones, balloons, swamp gas). Demand hard evidence and question witness reliability.";
        case 'Viral': return "Viral: Sensationalist, high-excitement, clickbait style. Use short sentences. Focus on the 'scary' or 'mind-blowing' aspects. Use phrases like 'You won't believe this'.";
        default: return "Standard reporting.";
    }
}
