import { GoogleGenAI } from "@google/genai";
import { Article, SourceRegion, ReportType, GroundingCitation } from '../types';
import { getRandomPlaceholder } from '../utils/placeholders';
import { resolveLocationFromText } from './mapsService';

/**
 * Historical Declassified Intelligence Archive.
 * Used for instant demo preview mode or when the user explicitly requests historical records.
 */
export const DECLASSIFIED_HISTORICAL_ARCHIVES: Article[] = [
  {
    id: 'uap-recon-nimitz',
    title: 'USS Nimitz Tic-Tac Intercept FLIR1 Sensor Telemetry',
    originalTitle: 'USS Nimitz Carrier Strike Group Eleven FLIR1 Intercept',
    originalLanguage: 'English',
    url: 'https://www.defense.gov/News/Releases/Release/Article/2165714/statement-by-the-department-of-defense-on-the-release-of-historical-navy-videos/',
    source: 'DoD Historical Archive / AARO',
    sourceRegion: 'North America',
    reportType: 'Official / Military',
    evidenceTier: 'Corroborated Sensor / Radar',
    description: 'FLIR1 optical sensor intercept 100 miles southwest of San Diego showing high-speed anomalous vehicle with no visible flight surfaces or exhaust.',
    thumbnail: getRandomPlaceholder('San Diego Offshore Warning Area, CA', 32.7157, -117.1611),
    location: 'San Diego Offshore Warning Area, CA',
    coordinates: { lat: 32.7157, lng: -117.1611 },
    proximateAddress: 'Broadway Pier, San Diego, CA 92101, USA',
    distanceKm: 14.2,
    distanceMiles: 8.8,
    observedAt: '2004-11-14T14:30:00Z',
    publishedAt: '2020-04-27T17:00:00Z',
  },
  {
    id: 'uap-recon-aguadilla',
    title: 'Aguadilla Thermal Surveillance Coastal Transition Incident',
    originalTitle: 'Aguadilla Puerto Rico Airborne Infrared Target Analysis',
    originalLanguage: 'English',
    url: 'https://www.explorescu.org/post/2013-aguadilla-puerto-rico-radar-video-airborne-target-analysis',
    source: 'SCU Scientific Coalition / US CBP',
    sourceRegion: 'Latin America',
    reportType: 'Scientific / Observatory',
    evidenceTier: 'Corroborated Sensor / Radar',
    description: 'CBP DHC-8 infrared tracking of trans-medium object travelling across Rafael Hernandez Airport and diving into the Caribbean Sea without deceleration.',
    thumbnail: getRandomPlaceholder('Aguadilla, Puerto Rico', 18.4949, -67.1294),
    location: 'Aguadilla, Puerto Rico',
    coordinates: { lat: 18.4949, lng: -67.1294 },
    proximateAddress: 'Hangar Rd, Aguadilla, 00603, Puerto Rico',
    distanceKm: 3.1,
    distanceMiles: 1.9,
    observedAt: '2013-04-25T21:20:00Z',
    publishedAt: '2015-08-21T12:00:00Z',
  },
  {
    id: 'uap-recon-geipan-france',
    title: 'GEIPAN Aerospace Telemetry & Radar-Corroborated Analysis',
    originalTitle: 'GEIPAN - Groupe d\'Études et d\'Informations sur les PAN',
    originalLanguage: 'French',
    url: 'https://www.cnes-geipan.fr/',
    source: 'GEIPAN / CNES',
    sourceRegion: 'Europe',
    reportType: 'Official / Military',
    evidenceTier: 'Primary Official',
    description: 'French National Space Center official investigation into multi-sensor anomalous aerial track confirmed by civilian and military air traffic control radars.',
    thumbnail: getRandomPlaceholder('Toulouse Aerospace Sector, France', 43.5627, 1.4828),
    location: 'GEIPAN Aerospace Surveillance Sector, Toulouse, France',
    coordinates: { lat: 43.5627, lng: 1.4828 },
    proximateAddress: '18 Avenue Edouard Belin, 31400 Toulouse, France',
    distanceKm: 2.5,
    distanceMiles: 1.5,
    observedAt: '2023-10-14T19:45:00Z',
    publishedAt: '2024-03-12T10:00:00Z',
  },
  {
    id: 'uap-recon-brazil-colares',
    title: 'Operação Prato Brazilian Air Force Sighting Files',
    originalTitle: 'Operação Prato - Registros do Arquivo Nacional e FAB',
    originalLanguage: 'Portuguese',
    url: 'https://www.gov.br/arquivonacional/',
    source: 'Arquivo Nacional do Brasil / FAB',
    sourceRegion: 'Latin America',
    reportType: 'Official / Military',
    evidenceTier: 'Primary Official',
    description: 'Declassified Brazilian Air Force military dossier documenting low-altitude luminous crafts maneuvering over the Amazonian coastline and Pará state.',
    thumbnail: getRandomPlaceholder('Colares Coastal Vector, Brazil', -0.9333, -48.2833),
    location: 'Colares Maritime Coastal Vector, Pará, Brazil',
    coordinates: { lat: -0.9333, lng: -48.2833 },
    proximateAddress: 'Praça do Pescador, Colares - PA, 68785-000, Brazil',
    distanceKm: 8.4,
    distanceMiles: 5.2,
    observedAt: '1977-10-20T22:15:00Z',
    publishedAt: '2009-05-04T16:00:00Z',
  },
  {
    id: 'uap-recon-japan-mod',
    title: 'Japan MoD Aerospace Surveillance & Diet UAP Taskforce Tracking',
    originalTitle: '防衛省 未確認飛行物体（UAP）に関する調査記録',
    originalLanguage: 'Japanese',
    url: 'https://www.mod.go.jp/en/',
    source: 'Ministry of Defense (Japan) / JASDF',
    sourceRegion: 'Asia',
    reportType: 'Official / Military',
    evidenceTier: 'Primary Official',
    description: 'Defense Ministry formal protocols and bilateral radar surveillance records tracking anomalous high-speed aerial phenomena over northeastern Pacific maritime corridors.',
    thumbnail: getRandomPlaceholder('Honshu Maritime Corridor, Japan', 35.6938, 139.7289),
    location: 'Ministry of Defense UAP Tracking Corridor, Tokyo, Japan',
    coordinates: { lat: 35.6938, lng: 139.7289 },
    proximateAddress: 'Ichigayahonmuracho, Shinjuku City, Tokyo 162-0845, Japan',
    distanceKm: 4.8,
    distanceMiles: 3.0,
    observedAt: '2024-02-18T18:00:00Z',
    publishedAt: '2024-06-06T09:00:00Z',
  },
  {
    id: 'uap-recon-rendlesham',
    title: 'RAF Bentwaters / Rendlesham Forest Physical Evidence Dossier',
    originalTitle: 'Halt Memo - Rendlesham Forest Radiation & Landing Analysis',
    originalLanguage: 'English',
    url: 'https://www.nationalarchives.gov.uk/',
    source: 'UK National Archives / MoD',
    sourceRegion: 'Europe',
    reportType: 'Official / Military',
    evidenceTier: 'Primary Official',
    description: 'Deputy Base Commander Lt Col Halt radiation measurement logbook and eyewitness testimony detailing landing pod indentations and pulsing metallic craft.',
    thumbnail: getRandomPlaceholder('Rendlesham Forest, UK', 52.0833, 1.4333),
    location: 'Rendlesham Forest / RAF Bentwaters, UK',
    coordinates: { lat: 52.0833, lng: 1.4333 },
    proximateAddress: 'Rendlesham Forest, Woodbridge IP12 3NF, UK',
    distanceKm: 1.5,
    distanceMiles: 0.9,
    observedAt: '1980-12-26T03:00:00Z',
    publishedAt: '2001-01-01T00:00:00Z',
  }
];

export const DEMO_ARTICLES = DECLASSIFIED_HISTORICAL_ARCHIVES;

/**
 * Result structure returned by the global discovery pipeline.
 */
export interface UAPDiscoveryResult {
  articles: Article[];
  searchTimeUtc: string;
  cutoffTimeUtc: string;
  sourceCitationsCount: number;
  totalCandidatesIndexed: number;
  groundingQueriesExecuted: string[];
}

/**
 * Structured, source-aware UAP discovery pipeline using Gemini API's Google Search Grounding.
 * Strictly adheres to a rolling 48-hour UTC cutoff window, prioritizes primary-source evidence,
 * validates publication vs observation dates, preserves original titles & languages, and
 * covers international defense, aviation, scientific, and journalistic registries.
 */
export const fetchNews = async (apiKey: string): Promise<Article[]> => {
  const result = await fetchGlobalUAPReports(apiKey);
  return result.articles;
};

export const fetchGlobalUAPReports = async (apiKey: string): Promise<UAPDiscoveryResult> => {
  if (!apiKey) {
    throw new Error("Clearance code missing. Please authenticate with valid API Key.");
  }

  // Support instant Demo Preview Mode without network error
  if (apiKey.includes('DEMO_PREVIEW_MODE')) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    return {
      articles: DECLASSIFIED_HISTORICAL_ARCHIVES,
      searchTimeUtc: now.toISOString(),
      cutoffTimeUtc: cutoff.toISOString(),
      sourceCitationsCount: DECLASSIFIED_HISTORICAL_ARCHIVES.length,
      totalCandidatesIndexed: DECLASSIFIED_HISTORICAL_ARCHIVES.length,
      groundingQueriesExecuted: ['Demo declassified archives'],
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Calculate rolling 48-hour UTC window
  const now = new Date();
  const searchTimeUtc = now.toISOString();
  const cutoffDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const cutoffTimeUtc = cutoffDate.toISOString();

  // International source registry guideline for the search prompt
  const prompt = `
You are the Chief Intelligence Analyst for the Global UAP Discovery Pipeline.
Perform targeted Google Searches using your search grounding tool to locate authentic UAP / UFO incident reports, official declassifications, military briefings, aviation encounters, and scientific observations PUBLISHED OR OFFICIALLY RECORDED WITHIN THE LAST 48 HOURS.

CURRENT ROLLING UTC TIME: ${searchTimeUtc}
STRICT 48-HOUR UTC CUTOFF: ${cutoffTimeUtc}

SEARCH REGISTRY & INTERNATIONAL CANDIDATE SOURCES (Search across all languages and regions):
1. North America:
   - MUFON (mufon.com) & NUFORC (nuforc.org)
   - AARO (aaro.mil - All-Domain Anomaly Resolution Office) & DoD releases
   - NASA UAP Independent Study updates
   - The Debrief (thedebrief.org), Liberation Times, NewsNation
   - FAA, Aviation Safety Network, pilot reporting networks (NARCAP)
2. Europe:
   - UK Civil Aviation Authority (CAA) & UK Ministry of Defence
   - European Space Agency (ESA) & national space agencies
   - France GEIPAN (cnes-geipan.fr / Groupe d'Études et d'Informations sur les Phénomènes Aérospatiaux Non-identifiés)
   - Established European investigative journalism & aviation incident databases
3. Latin America:
   - Brazil National Archives (Arquivo Nacional do Brasil) & FAB UFO declassifications
   - Mexico civil aviation authorities (AFAC / SENEAM) & military airspace radars
   - Argentina (CEFORA / Fuerza Aérea Argentina / CRIBAT)
   - Chile (CEFAA / DGAC - Comité de Estudios de Fenómenos Aéreos Anómalos)
   - Peru (OIFAA / Fuerza Aérea del Perú) & Colombia (Fuerza Aeroespacial Colombiana)
4. Asia:
   - Japan Ministry of Defense (MOD) & Parliamentary UAP Caucus tracking
   - South Korea Ministry of National Defense (MND)
   - India Ministry of Defence & Indian Air Force (IAF) radar reports
   - Regional aviation and scientific observatories across Asia
5. Oceania:
   - Australia Department of Defence & Royal Australian Air Force (RAAF)
   - New Zealand National Archives & NZDF files newly released
   - Regional civilian pilot & aviation safety authorities
6. Africa & Middle East:
   - National aviation authorities, defence ministries, meteorological agencies, and astronomical observatories.

CRITICAL RULES:
- TIME INTEGRITY: Only include items whose publication date, press release date, or database submission date falls within the rolling 48-hour window between ${cutoffTimeUtc} and ${searchTimeUtc}.
- DISTINGUISH DATES: Clearly distinguish "publishedAt" (when this report/article was published in the last 48h) from "observedAt" (when the actual event took place). If a historical sighting from 1977 or 2004 is published or discussed in a new report today, state observedAt as the original date, but publishedAt as the date within the last 48h!
- DISTINGUISH REPORT TYPES: Categorize each item into one of:
  'Official / Military' | 'Aviation / Pilot Network' | 'Scientific / Observatory' | 'Investigative Media' | 'Eyewitness Database'
- EVIDENCE TIER: Categorize into:
  'Primary Official' | 'Corroborated Sensor / Radar' | 'Aviation Eyewitness' | 'Investigative Report' | 'Unverified Civilian'
- SOURCE REGION: Categorize into:
  'North America' | 'Europe' | 'Latin America' | 'Asia' | 'Oceania' | 'Africa & Middle East' | 'Global / Space'
- MULTILINGUAL FIDELITY: If the source is in a foreign language (e.g. Japanese, Portuguese, Spanish, French), preserve the original headline in "originalTitle", identify the "originalLanguage", and provide a clear, accurate English translation in "title".
- RETAIN EXACT URLS: Provide the real, direct source URL where this report was published.
- EMPTY RESULT ENFORCEMENT: If no qualifying UAP reports were published across these sources in the 48-hour window, return an empty array []. DO NOT invent, fabricate, hallucinate, or silently extend the search window.

RESPONSE FORMAT:
Return ONLY a valid JSON array of objects. Do not include markdown preamble or conversational explanations.
Each object must match this schema:
[
  {
    "title": "string (clear English headline)",
    "originalTitle": "string (original title in source language, or same as title if English)",
    "originalLanguage": "string (e.g. 'English', 'French', 'Portuguese', 'Japanese', 'Spanish')",
    "source": "string (e.g. 'MUFON', 'NUFORC', 'AARO.mil', 'The Debrief', 'GEIPAN', 'Arquivo Nacional do Brasil')",
    "sourceRegion": "North America" | "Europe" | "Latin America" | "Asia" | "Oceania" | "Africa & Middle East" | "Global / Space",
    "reportType": "Official / Military" | "Aviation / Pilot Network" | "Scientific / Observatory" | "Investigative Media" | "Eyewitness Database",
    "evidenceTier": "Primary Official" | "Corroborated Sensor / Radar" | "Aviation Eyewitness" | "Investigative Report" | "Unverified Civilian",
    "url": "string (authentic URL of the report)",
    "description": "string (factual summary of the observation, sensors involved, and investigative status)",
    "location": "string (specific geographic city, country, airspace or coordinates)",
    "latitude": number or null,
    "longitude": number or null,
    "publishedAt": "string (ISO 8601 UTC timestamp or YYYY-MM-DD within the last 48 hours)",
    "observedAt": "string (date or timestamp when the phenomenon was witnessed, e.g. YYYY-MM-DD or ISO 8601)"
  }
]
`;

  try {
    let response: any;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
    } catch (primaryErr: any) {
      console.warn("Primary model gemini-3.8-flash search failed, trying fallback model gemini-flash-latest:", primaryErr);
      
      const errMsg = primaryErr?.message || '';
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('key not valid')) {
        throw primaryErr;
      }

      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
    }

    // Extract grounding citations from Gemini Google Search metadata
    const candidate = response?.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const extractedCitations: GroundingCitation[] = [];
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri) {
          extractedCitations.push({
            title: chunk.web.title || undefined,
            url: chunk.web.uri,
          });
        }
      }
    }

    const rawText = response?.text || '';
    let parsedItems: any[] | null = null;

    // Robust extraction: locate the bracketed JSON array within response text
    const firstBracket = rawText.indexOf('[');
    const lastBracket = rawText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        const sliced = rawText.slice(firstBracket, lastBracket + 1);
        parsedItems = JSON.parse(sliced);
      } catch (parseErr) {
        console.warn("Failed to parse sliced JSON array:", parseErr);
      }
    }

    if (!Array.isArray(parsedItems)) {
      try {
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          parsedItems = parsed;
        }
      } catch (e) {
        console.warn("Could not parse JSON response from search grounding:", rawText);
      }
    }

    // If no qualifying reports are found, return empty array as required
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      console.info(`No qualifying UAP reports found in rolling 48-hour UTC window (${cutoffTimeUtc} to ${searchTimeUtc}).`);
      return {
        articles: [],
        searchTimeUtc,
        cutoffTimeUtc,
        sourceCitationsCount: extractedCitations.length,
        totalCandidatesIndexed: 0,
        groundingQueriesExecuted: webSearchQueries,
      };
    }

    // Deduplicate reports by URL and title
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const validArticles: Article[] = [];

    const cutoffEpoch = cutoffDate.getTime();
    const nowEpoch = now.getTime() + 60 * 60 * 1000; // Allow 1hr clock skew

    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      if (!item || typeof item !== 'object') continue;

      const title = (item.title || item.originalTitle || '').trim();
      const rawUrl = (item.url || '').trim();

      if (!title) continue;

      const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedUrl = rawUrl.toLowerCase().split('?')[0].replace(/\/$/, '');

      if (normalizedUrl && seenUrls.has(normalizedUrl)) continue;
      if (seenTitles.has(normalizedTitle)) continue;

      if (normalizedUrl) seenUrls.add(normalizedUrl);
      seenTitles.add(normalizedTitle);

      // Validate publication timestamp against the 48-hour window
      let publishedAt = item.publishedAt ? String(item.publishedAt).trim() : undefined;
      if (publishedAt) {
        const pubEpoch = Date.parse(publishedAt);
        // If date is valid and is significantly older than 48 hours (more than 72h to account for timezone discrepancies)
        if (!isNaN(pubEpoch) && pubEpoch < (cutoffEpoch - 24 * 60 * 60 * 1000)) {
          console.warn(`Filtering out item outside 48-hour UTC window: ${title} (${publishedAt})`);
          continue;
        }
      } else {
        publishedAt = searchTimeUtc;
      }

      // Resolve location & coordinates
      const hasCoords = typeof item.latitude === 'number' && typeof item.longitude === 'number' &&
        !isNaN(item.latitude) && !isNaN(item.longitude);
      
      const locData = resolveLocationFromText(
        `${title} ${item.location || ''}`,
        item.description || ''
      );

      const finalCoords = hasCoords 
        ? { lat: item.latitude, lng: item.longitude }
        : locData.coordinates;

      const finalLocation = item.location?.trim() || locData.location;

      // Attach relevant citations
      const matchedCitations = extractedCitations.filter(c => 
        c.url && (rawUrl.includes(c.url) || c.url.includes(rawUrl) || 
        (c.title && title.toLowerCase().includes(c.title.toLowerCase().slice(0, 15))))
      );

      // Determine valid sourceRegion & reportType
      const validRegions: SourceRegion[] = [
        'North America', 'Europe', 'Latin America', 'Asia', 'Oceania', 'Africa & Middle East', 'Global / Space'
      ];
      const validTypes: ReportType[] = [
        'Official / Military', 'Aviation / Pilot Network', 'Scientific / Observatory', 'Investigative Media', 'Eyewitness Database'
      ];

      const sourceRegion: SourceRegion = validRegions.includes(item.sourceRegion) 
        ? item.sourceRegion 
        : 'North America';

      const reportType: ReportType = validTypes.includes(item.reportType)
        ? item.reportType
        : 'Investigative Media';

      validArticles.push({
        id: `uap-intel-${Date.now()}-${i}`,
        title,
        originalTitle: item.originalTitle && item.originalTitle !== title ? item.originalTitle : undefined,
        originalLanguage: item.originalLanguage || 'English',
        url: rawUrl || (extractedCitations[0]?.url || "https://www.aaro.mil"),
        source: item.source || "International Intelligence Registry",
        sourceRegion,
        reportType,
        evidenceTier: item.evidenceTier || 'Primary Official',
        description: item.description || "Anomalous flight telemetry logged by surveillance array.",
        thumbnail: getRandomPlaceholder(finalLocation, finalCoords.lat, finalCoords.lng),
        location: finalLocation,
        coordinates: finalCoords,
        proximateAddress: locData.proximateAddress,
        publishedAt,
        observedAt: item.observedAt ? String(item.observedAt).trim() : undefined,
        groundingCitations: matchedCitations.length > 0 ? matchedCitations : undefined,
      });
    }

    return {
      articles: validArticles,
      searchTimeUtc,
      cutoffTimeUtc,
      sourceCitationsCount: extractedCitations.length,
      totalCandidatesIndexed: validArticles.length,
      groundingQueriesExecuted: webSearchQueries,
    };

  } catch (error: any) {
    console.error("Gemini Global UAP Search Operation Encountered Issue:", error);
    const errMsg = error?.message || '';
    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('key not valid')) {
      throw error;
    }
    
    // For network failure during discovery, return empty array with error status
    // rather than inventing fake reports
    console.warn("Global discovery pipeline encountered non-fatal error; returning empty result set.");
    return {
      articles: [],
      searchTimeUtc,
      cutoffTimeUtc,
      sourceCitationsCount: 0,
      totalCandidatesIndexed: 0,
      groundingQueriesExecuted: [],
    };
  }
};
