import { GoogleGenAI, Modality } from "@google/genai";
import { ReporterStyle, VoiceID } from '../types';

export interface CinematicImageResult {
  imageUrl: string;
  modelUsed: string;
  promptUsed: string;
  isFallback: boolean;
}

/**
 * Generates an intelligence briefing dossier in Markdown format using Gemini 3.8 Flash.
 */
export const generateIntelBriefing = async (
  apiKey: string,
  title: string,
  description: string,
  source: string,
  style: ReporterStyle
): Promise<string> => {
  if (!apiKey) throw new Error("Authentication missing.");
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an undercover UAP Intelligence Officer attached to the "Nexus" monitoring station.
    
    SUBJECT INTELLIGENCE:
    Title: "${title}"
    Source: "${source}"
    Intel Summary: "${description}"
    
    Directives:
    Generate a briefing dossier / investigative report about this event.
    Use the Intel Summary as the factual basis for the report, expanding with technical sensor analysis, military cross-referencing, and eyewitness forensic details according to the chosen persona.
    
    Adopt the following Persona strictly:
    ${getPersonaDescription(style)}
    
    Format:
    - Plain text with Markdown formatting (headers, bold, bullet points).
    - Length: Approximately 280-350 words.
    - Start directly with the dossier content. Include a classification header block and conclusion recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return response.text || "Encryption Error: Data packet corrupted.";
  } catch (error) {
    console.error("Intel Generation Failed with primary model, trying fallback:", error);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });
      return fallbackResponse.text || "Encryption Error: Data packet corrupted.";
    } catch (fallbackError) {
      console.error("Intel Generation Fallback Failed:", fallbackError);
      throw new Error("Failed to decrypt intelligence report.");
    }
  }
};

/**
 * Generates a highly accurate-to-reported-description photographic cinematic image
 * using Nano Banana Pro (gemini-3-pro-image) with automatic fallback to other models
 * (gemini-3.1-flash-image, gemini-3.1-flash-lite-image, imagen-3.0-generate-002, or procedural reconstruction).
 */
export const generateCinematicReportImage = async (
  apiKey: string,
  title: string,
  description: string,
  reportText?: string
): Promise<CinematicImageResult> => {
  const cleanSnippet = reportText ? reportText.slice(0, 350).replace(/[*#]/g, ' ') : '';
  const prompt = `A highly realistic, photographic, cinematic 35mm optical surveillance photograph depicting the exact Unidentified Anomalous Phenomenon described in this intelligence dossier:
Subject: "${title}"
Reported Sensor & Physical Description: "${description}"
Briefing Telemetry Excerpt: "${cleanSnippet}"

VISUAL AESTHETIC REQUIREMENTS:
- Hyper-realistic photographic cinematic frame, authentic 35mm/70mm camera lens aperture f/2.8, fine optical grain, real volumetric atmospheric scattering.
- Accurately portrays the anomalous craft or phenomenon shape, surface reflection, ionization glow, and altitude exactly as documented.
- Declassified defense reconnaissance optical surveillance camera capture: sharp details of the vehicle, authentic real-world lighting and weather conditions.
- Cinematic anamorphic 16:9 composition, realistic military/investigative documentation, zero cartoonish CGI or fantastical elements.`;

  if (!apiKey) {
    return {
      imageUrl: createProceduralCinematicReconstruction(title, description),
      modelUsed: 'Forensic Reconstruction Sensor Simulation (BYOK Pending)',
      promptUsed: prompt,
      isFallback: true,
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Tier 1: Nano Banana Pro ('gemini-3-pro-image')
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: '1K',
        },
      },
    });

    for (const part of res.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return {
          imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
          modelUsed: 'Nano Banana Pro (gemini-3-pro-image)',
          promptUsed: prompt,
          isFallback: false,
        };
      }
    }
  } catch (err: any) {
    console.warn("Nano Banana Pro (gemini-3-pro-image) failed or quota reached. Trying Nano Banana 2:", err.message);
  }

  // Tier 2: Nano Banana 2 ('gemini-3.1-flash-image')
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: '1K',
        },
      },
    });

    for (const part of res.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return {
          imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
          modelUsed: 'Nano Banana 2 (gemini-3.1-flash-image)',
          promptUsed: prompt,
          isFallback: false,
        };
      }
    }
  } catch (err: any) {
    console.warn("Nano Banana 2 (gemini-3.1-flash-image) failed. Trying Nano Banana Lite:", err.message);
  }

  // Tier 3: Nano Banana Lite ('gemini-3.1-flash-lite-image')
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    for (const part of res.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return {
          imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
          modelUsed: 'Nano Banana Lite (gemini-3.1-flash-lite-image)',
          promptUsed: prompt,
          isFallback: false,
        };
      }
    }
  } catch (err: any) {
    console.warn("Nano Banana Lite failed. Trying Imagen 3 (imagen-3.0-generate-002):", err.message);
  }

  // Tier 4: Imagen 3 ('imagen-3.0-generate-002')
  try {
    const imagenRes = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const b64 = imagenRes.generatedImages?.[0]?.image?.imageBytes;
    if (b64) {
      return {
        imageUrl: `data:image/jpeg;base64,${b64}`,
        modelUsed: 'Imagen 3 (imagen-3.0-generate-002)',
        promptUsed: prompt,
        isFallback: false,
      };
    }
  } catch (err: any) {
    console.warn("Imagen 3 fallback failed or tokens used up:", err.message);
  }

  // Tier 5: High-Fidelity Forensic Reconstruction Canvas (Always succeeds for free/offline/quota users)
  return {
    imageUrl: createProceduralCinematicReconstruction(title, description),
    modelUsed: 'Forensic Reconstruction Sensor Simulation (Token Quota Exceeded / Free Tier Fallback)',
    promptUsed: prompt,
    isFallback: true,
  };
};

/**
 * Backward compatibility wrapper for legacy callers
 */
export const generateVisualReconstruction = async (
  apiKey: string,
  title: string,
  description: string
): Promise<string> => {
  const result = await generateCinematicReportImage(apiKey, title, description);
  return result.imageUrl;
};

/**
 * Cleans narrative intelligence text for natural, seamless speech synthesis.
 * Removes raw markdown punctuation and formats military classification markers for verbal broadcast.
 */
function prepareTextForSpeech(rawText: string): string {
  return rawText
    // Format Top Secret / Classification banners into natural speech
    .replace(/\/\/\s*TOP SECRET\s*\/\//gi, 'Top Secret.')
    .replace(/\/\/\s*NEXUS-EYES ONLY\s*\/\//gi, 'Nexus eyes only.')
    .replace(/\/\/\s*DISCLOSURE PRIORITY:\s*CRITICAL\s*\/\//gi, 'Disclosure priority: critical.')
    .replace(/\/\/\s*/g, ' ')
    // Strip markdown formatting symbols
    .replace(/[*#_`]/g, '')
    // Format bullet points into smooth verbal transitions
    .replace(/^\s*[-•]\s*/gm, 'Point: ')
    // Normalize spacing
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits long text into natural sentence-level chunks without breaking mid-word or mid-sentence.
 */
function splitIntoSentenceChunks(text: string, maxChunkLength: number = 1800): string[] {
  if (text.length <= maxChunkLength) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkLength && currentChunk.trim()) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generates an audio briefing using Gemini TTS without early cutoffs or screeching double-headers.
 */
export const generateAudioBriefing = async (
  apiKey: string,
  text: string,
  voiceId: VoiceID
): Promise<string> => {
  if (!apiKey) throw new Error("Authentication missing.");

  const ai = new GoogleGenAI({ apiKey });
  const cleanedText = prepareTextForSpeech(text);
  const chunks = splitIntoSentenceChunks(cleanedText, 2200);

  const audioClips: string[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: { parts: [{ text: chunk }] },
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
      if (audioData) {
        audioClips.push(audioData);
      }
    } catch (error) {
      console.warn("TTS primary model attempt failed for chunk, trying backup:", error);
      try {
        const backupResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash-tts",
          contents: { parts: [{ text: chunk }] },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceId },
              },
            },
          },
        });
        const backupAudio = backupResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (backupAudio) {
          audioClips.push(backupAudio);
        }
      } catch (backupErr) {
        console.error("TTS backup attempt also failed for chunk:", backupErr);
      }
    }
  }

  if (audioClips.length === 0) {
    throw new Error("Voice synthesis module offline or rejected audio transmission.");
  }

  // If single clip, return directly
  if (audioClips.length === 1) {
    return audioClips[0];
  }

  // If multiple chunks, merge raw PCM samples with a single valid WAV header
  return mergeBase64WavClips(audioClips);
};

/**
 * Combines multiple base64 WAV clips into a single base64 WAV string with unified header.
 */
function mergeBase64WavClips(clips: string[], sampleRate: number = 24000): string {
  const pcmChunks: Uint8Array[] = [];
  let totalLength = 0;

  for (const clip of clips) {
    const raw = atob(clip);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }

    // Strip 44-byte WAV header if present
    const hasHeader =
      bytes.length >= 12 &&
      bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && // RIFF
      bytes[8] === 87 && bytes[9] === 65 && bytes[10] === 86 && bytes[11] === 69;   // WAVE

    let pcm = hasHeader ? bytes.subarray(44) : bytes;
    if (pcm.length % 2 !== 0) {
      pcm = pcm.subarray(0, pcm.length - 1);
    }

    pcmChunks.push(pcm);
    totalLength += pcm.length;
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  const buffer = new ArrayBuffer(44 + totalLength);
  const view = new DataView(buffer);

  // Write RIFF header
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, totalLength, true);

  const outBytes = new Uint8Array(buffer);
  let offset = 44;
  for (const pcm of pcmChunks) {
    outBytes.set(pcm, offset);
    offset += pcm.length;
  }

  let binary = '';
  const len = outBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(outBytes[i]);
  }
  return btoa(binary);
}

/**
 * Creates an authentic high-resolution forensic photographic simulation canvas
 * for free-tier users or when API quotas are temporarily exhausted.
 */
function createProceduralCinematicReconstruction(title: string, description: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Dark atmospheric night sky / horizon gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, '#020b08');
  grad.addColorStop(0.4, '#071813');
  grad.addColorStop(0.7, '#0d281e');
  grad.addColorStop(1, '#05100b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // 2. Distant cloud layers / atmospheric haze
  for (let i = 0; i < 6; i++) {
    const cloudGrad = ctx.createRadialGradient(
      200 + i * 200, 300 + (i % 3) * 60, 20,
      200 + i * 200, 300 + (i % 3) * 60, 260
    );
    cloudGrad.addColorStop(0, 'rgba(22, 101, 52, 0.15)');
    cloudGrad.addColorStop(0.5, 'rgba(6, 78, 59, 0.08)');
    cloudGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(200 + i * 200, 300 + (i % 3) * 60, 260, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Horizon line / mountain contour
  ctx.fillStyle = '#020604';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.lineTo(240, 480);
  ctx.lineTo(480, 510);
  ctx.lineTo(760, 460);
  ctx.lineTo(1020, 500);
  ctx.lineTo(1280, 470);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  // 4. Anomalous vehicle / target luminosity in center
  const targetX = 640;
  const targetY = 280;

  // Thermal plasma glow
  const plasmaGlow = ctx.createRadialGradient(targetX, targetY, 10, targetX, targetY, 220);
  plasmaGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  plasmaGlow.addColorStop(0.2, 'rgba(74, 222, 128, 0.85)');
  plasmaGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)');
  plasmaGlow.addColorStop(0.8, 'rgba(16, 185, 129, 0.15)');
  plasmaGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = plasmaGlow;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 220, 0, Math.PI * 2);
  ctx.fill();

  // Metallic hull geometry (smooth elliptical Tic-Tac / Disk craft)
  ctx.save();
  ctx.translate(targetX, targetY);
  ctx.rotate(-0.12);

  // Outer hull reflection
  const hullGrad = ctx.createLinearGradient(-110, -35, 110, 35);
  hullGrad.addColorStop(0, '#e2e8f0');
  hullGrad.addColorStop(0.3, '#94a3b8');
  hullGrad.addColorStop(0.6, '#475569');
  hullGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = hullGrad;

  ctx.beginPath();
  ctx.ellipse(0, 0, 95, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ionization boundary rim
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.restore();

  // 5. Tactical optical HUD / Sensor Overlays
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;

  // Center Crosshairs
  ctx.beginPath();
  ctx.arc(targetX, targetY, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(targetX - 100, targetY);
  ctx.lineTo(targetX - 75, targetY);
  ctx.moveTo(targetX + 75, targetY);
  ctx.lineTo(targetX + 100, targetY);
  ctx.moveTo(targetX, targetY - 100);
  ctx.lineTo(targetX, targetY - 75);
  ctx.moveTo(targetX, targetY + 75);
  ctx.lineTo(targetX, targetY + 100);
  ctx.stroke();

  // Bounding tracking brackets
  const bSize = 35;
  const left = targetX - 140;
  const right = targetX + 140;
  const top = targetY - 70;
  const bot = targetY + 70;

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  // Top Left
  ctx.strokeRect(left, top, bSize, 0);
  ctx.strokeRect(left, top, 0, bSize);
  // Top Right
  ctx.strokeRect(right - bSize, top, bSize, 0);
  ctx.strokeRect(right, top, 0, bSize);
  // Bottom Left
  ctx.strokeRect(left, bot, bSize, 0);
  ctx.strokeRect(left, bot - bSize, 0, bSize);
  // Bottom Right
  ctx.strokeRect(right - bSize, bot, bSize, 0);
  ctx.strokeRect(right, bot - bSize, 0, bSize);

  // HUD Text Telemetry
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('TARGET LOCK: [ANOMALOUS AERODYNAMIC PROFILE]', left - 20, top - 18);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#86efac';
  ctx.fillText(`SUBJECT: ${title.slice(0, 48).toUpperCase()}`, 40, 50);
  ctx.fillText('SENSOR: 35MM OPTICAL SURVEILLANCE // FLIR-IR BAND III', 40, 70);
  ctx.fillText('RCS: < 0.001 m² // VELOCITY: SUPERSONIC TRANS-MEDIUM', 40, 90);
  ctx.fillText('CLEARANCE: TOP SECRET // SI-TK // NOFORN', 940, 50);
  ctx.fillText('ALTITUDE: FL280 // ELEVATION: +14.2°', 940, 70);
  ctx.fillText('RESOLUTION: 4K HIGH // NANO BANANA SURVEILLANCE', 940, 90);

  // Bottom telemetry bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 670, 1280, 50);
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.strokeRect(0, 670, 1280, 1);
  ctx.fillStyle = '#22c55e';
  ctx.font = '11px monospace';
  ctx.fillText(`GEO_REF: ${description.slice(0, 110)}...`, 40, 700);

  return canvas.toDataURL('image/jpeg', 0.92);
}

function getPersonaDescription(style: ReporterStyle): string {
  switch(style) {
    case 'Academic':
      return "Academic: Maintain a formal, rigorous tone. Cite sensor telemetry, radar cross-sections, and Doppler signatures. Avoid speculation. Use scientific terminology regarding atmospheric optics and non-ballistic kinematics.";
    case 'Gonzo':
      return "Gonzo: High energy, paranoid, first-person investigative perspective. Uncover deep-state compartmentalization, question official press releases, and describe the visceral encounter with vivid technical metaphors.";
    case 'Skeptic':
      return "Skeptic: Critical, forensic analytical tone. Scrutinize potential mundane explanations (hypersonic drones, sensor lens artifacts, electronic warfare spoofing) before acknowledging anomalous parameters.";
    case 'Viral':
      return "Viral: Urgent disclosure style, dramatic pacing, high impact. Highlight the national security implications, trans-medium flight dynamics, and historical precedent.";
    default:
      return "Standard top secret intelligence reporting.";
  }
}
