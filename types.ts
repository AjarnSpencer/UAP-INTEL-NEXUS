
export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string;
}

export type VoiceID = 'Fenrir' | 'Kore' | 'Charon' | 'Aoede' | 'Zephyr' | 'Puck' | 'Leda' | 'Orus';

export type ReporterStyle = 'Academic' | 'Gonzo' | 'Skeptic' | 'Viral';

export interface EnhancedContent {
  content: string;
  style: ReporterStyle;
  audioData?: string; // Base64 encoded audio
}
