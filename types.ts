
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

export type SourceRegion = 
  | 'North America' 
  | 'Europe' 
  | 'Latin America' 
  | 'Asia' 
  | 'Oceania' 
  | 'Africa & Middle East' 
  | 'Global / Space';

export type ReportType = 
  | 'Official / Military' 
  | 'Aviation / Pilot Network' 
  | 'Scientific / Observatory' 
  | 'Investigative Media' 
  | 'Eyewitness Database';

export interface GroundingCitation {
  title?: string;
  url?: string;
}

export interface Article {
  id: string;
  title: string;
  originalTitle?: string;
  originalLanguage?: string;
  url: string;
  source: string;
  sourceRegion?: SourceRegion;
  reportType?: ReportType;
  description: string;
  thumbnail: string;
  location?: string;
  coordinates?: UAPCoordinates;
  proximateAddress?: string;
  distanceKm?: number;
  distanceMiles?: number;
  publishedAt?: string;
  observedAt?: string;
  evidenceTier?: 'Primary Official' | 'Corroborated Sensor / Radar' | 'Aviation Eyewitness' | 'Investigative Report' | 'Unverified Civilian';
  groundingCitations?: GroundingCitation[];
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

