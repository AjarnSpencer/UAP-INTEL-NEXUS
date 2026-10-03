/**
 * Robust audio decoding, WAV parsing, and seamless concatenation utilities for Gemini TTS.
 */

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
};

export interface ParsedWav {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  pcmData: Uint8Array;
}

/**
 * Accurately parses a RIFF/WAVE container by traversing RIFF sub-chunks.
 * Finds the exact 'data' chunk boundary to eliminate header bleed and screeching noise.
 */
export const parseWav = (bytes: Uint8Array): ParsedWav | null => {
  if (bytes.length < 12) return null;

  // Verify 'RIFF' descriptor (bytes 0..3) and 'WAVE' format (bytes 8..11)
  if (
    bytes[0] !== 82 || bytes[1] !== 73 || bytes[2] !== 70 || bytes[3] !== 70 ||
    bytes[8] !== 87 || bytes[9] !== 65 || bytes[10] !== 86 || bytes[11] !== 69
  ) {
    return null;
  }

  let sampleRate = 24000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let pcmData: Uint8Array | null = null;

  let offset = 12;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  while (offset + 8 <= bytes.length) {
    const chunkId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );
    const chunkSize = view.getUint32(offset + 4, true);
    const chunkDataOffset = offset + 8;

    if (chunkId === 'fmt ') {
      if (chunkSize >= 16 && chunkDataOffset + 16 <= bytes.length) {
        numChannels = view.getUint16(chunkDataOffset + 2, true);
        sampleRate = view.getUint32(chunkDataOffset + 4, true);
        bitsPerSample = view.getUint16(chunkDataOffset + 14, true);
      }
    } else if (chunkId === 'data') {
      const actualSize = Math.min(chunkSize, bytes.length - chunkDataOffset);
      pcmData = bytes.subarray(chunkDataOffset, chunkDataOffset + actualSize);
      break;
    }

    // Advance offset to next chunk (padded to 2-byte boundary)
    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (!pcmData) return null;
  return { sampleRate, numChannels, bitsPerSample, pcmData };
};

/**
 * Checks whether the given byte array begins with the standard RIFF/WAVE header.
 */
export const isWavHeaderPresent = (bytes: Uint8Array): boolean => {
  if (bytes.length < 12) return false;
  return (
    bytes[0] === 82 && // 'R'
    bytes[1] === 73 && // 'I'
    bytes[2] === 70 && // 'F'
    bytes[3] === 70 && // 'F'
    bytes[8] === 87 && // 'W'
    bytes[9] === 65 && // 'A'
    bytes[10] === 86 && // 'V'
    bytes[11] === 69    // 'E'
  );
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Creates a valid WAV Blob from base64 audio data.
 * Avoids double-wrapping when Gemini TTS unary output already includes a valid WAV container.
 */
export const createWavBlob = (base64Data: string, sampleRate: number = 24000): Blob => {
  const bytes = base64ToUint8Array(base64Data);

  // If Gemini already returned a full, well-formed WAV container, return directly
  if (isWavHeaderPresent(bytes)) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Otherwise, treat as raw 16-bit mono PCM and prepend standard 44-byte RIFF header
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = bytes.length;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const outBytes = new Uint8Array(buffer);
  outBytes.set(bytes, 44);

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Concatenates multiple base64 audio clips into one seamless, click-free WAV Blob.
 * Strips WAV headers accurately using RIFF chunk traversal, merges raw PCM buffers,
 * and prepends a single verified WAV header with the correct total byte count.
 */
export const concatenateWavClips = (base64Clips: string[], fallbackSampleRate: number = 24000): Blob => {
  if (base64Clips.length === 0) {
    return new Blob([], { type: 'audio/wav' });
  }

  // Single clip optimization: return directly without re-encoding
  if (base64Clips.length === 1) {
    return createWavBlob(base64Clips[0], fallbackSampleRate);
  }

  const pcmChunks: Uint8Array[] = [];
  let totalPcmLength = 0;
  let activeSampleRate = fallbackSampleRate;
  let activeNumChannels = 1;
  let activeBitsPerSample = 16;

  for (const b64 of base64Clips) {
    const rawBytes = base64ToUint8Array(b64);
    if (rawBytes.length === 0) continue;

    const parsed = parseWav(rawBytes);
    let pcmPart: Uint8Array;

    if (parsed) {
      pcmPart = parsed.pcmData;
      activeSampleRate = parsed.sampleRate;
      activeNumChannels = parsed.numChannels;
      activeBitsPerSample = parsed.bitsPerSample;
    } else {
      pcmPart = rawBytes;
    }

    // Ensure 16-bit audio alignment (even number of bytes)
    if (pcmPart.length % 2 !== 0) {
      pcmPart = pcmPart.subarray(0, pcmPart.length - 1);
    }

    pcmChunks.push(pcmPart);
    totalPcmLength += pcmPart.length;
  }

  // Build a single unified WAV container
  const byteRate = (activeSampleRate * activeNumChannels * activeBitsPerSample) / 8;
  const blockAlign = (activeNumChannels * activeBitsPerSample) / 8;

  const buffer = new ArrayBuffer(44 + totalPcmLength);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalPcmLength, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, activeNumChannels, true);
  view.setUint32(24, activeSampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, activeBitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, totalPcmLength, true);

  // Concatenate all PCM chunks sequentially
  const outBytes = new Uint8Array(buffer);
  let offset = 44;
  for (const chunk of pcmChunks) {
    outBytes.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};
