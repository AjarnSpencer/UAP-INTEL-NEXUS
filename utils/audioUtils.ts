/**
 * Audio decoding and WAV construction utilities for Gemini TTS.
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

/**
 * Checks whether the given byte array begins with the RIFF/WAVE header.
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

/**
 * Creates a valid WAV Blob from base64 audio data.
 * Crucially avoids double-wrapping when Gemini TTS unary output already includes a 44-byte WAV header.
 */
export const createWavBlob = (base64Data: string, sampleRate: number = 24000): Blob => {
  const bytes = base64ToUint8Array(base64Data);

  // If Gemini already returned a full WAV container (with RIFF/WAVE header),
  // return it directly so we don't corrupt the PCM stream with double headers.
  if (isWavHeaderPresent(bytes)) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Otherwise, it is raw 16-bit mono PCM. Wrap with standard 44-byte RIFF header.
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
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const outBytes = new Uint8Array(buffer);
  outBytes.set(bytes, 44);

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Concatenates multiple base64 audio clips into one seamless, click-free WAV Blob.
 * Strips WAV headers from each clip, merges raw PCM buffers, and prepends a single verified WAV header.
 */
export const concatenateWavClips = (base64Clips: string[], sampleRate: number = 24000): Blob => {
  if (base64Clips.length === 0) {
    return new Blob([], { type: 'audio/wav' });
  }

  const pcmChunks: Uint8Array[] = [];
  let totalPcmLength = 0;

  for (const b64 of base64Clips) {
    const rawBytes = base64ToUint8Array(b64);
    if (rawBytes.length === 0) continue;

    // If WAV header is present, skip the 44-byte header to get pure PCM audio samples
    let pcmPart: Uint8Array;
    if (isWavHeaderPresent(rawBytes)) {
      pcmPart = rawBytes.subarray(44);
    } else {
      pcmPart = rawBytes;
    }

    // Ensure even byte length for 16-bit audio alignment
    if (pcmPart.length % 2 !== 0) {
      pcmPart = pcmPart.subarray(0, pcmPart.length - 1);
    }

    pcmChunks.push(pcmPart);
    totalPcmLength += pcmPart.length;
  }

  // Build a single unified WAV container
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

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
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

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

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};
