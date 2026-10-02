
export interface UAPCoordinates {
  lat: number;
  lng: number;
}

export interface AerialVideoData {
  state: 'ACTIVE' | 'PROCESSING' | 'NOT_FOUND' | 'ERROR' | 'IDLE';
  videoId?: string;
  landscapeUri?: string;
  portraitUri?: string;
  captureDate?: {
    year: number;
    month: number;
    day: number;
  };
  duration?: string;
  errorMessage?: string;
  address?: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  description: string;
  thumbnail: string;
  location?: string;
  coordinates?: UAPCoordinates;
  proximateAddress?: string;
  distanceKm?: number;
  distanceMiles?: number;
}

export type VoiceID = 'Fenrir' | 'Kore' | 'Charon' | 'Aoede' | 'Zephyr' | 'Puck' | 'Leda' | 'Orus';

export type ReporterStyle = 'Academic' | 'Gonzo' | 'Skeptic' | 'Viral';

export interface EnhancedContent {
  content: string;
  style: ReporterStyle;
  audioData?: string; // Base64 encoded audio
}

export interface HotspotZone {
  id: string;
  name: string;
  codeName: string;
  description: string;
  coordinates: UAPCoordinates;
  address: string;
  verifiedVideoId?: string;
  sampleVideoUri?: string;
}

