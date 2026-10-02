
import { GoogleGenAI } from "@google/genai";
import { Article } from '../types';
import { getRandomPlaceholder } from '../utils/placeholders';
import { resolveLocationFromText } from './mapsService';

const DEMO_ARTICLES: Article[] = [
  {
    id: 'uap-recon-01',
    title: 'USS Nimitz Tic-Tac Intercept Coordinates Declassified',
    url: 'https://www.defense.gov/News/Releases/Release/Article/2165714/statement-by-the-department-of-defense-on-the-release-of-historical-navy-videos/',
    source: 'DoD Historical Archive / AARO',
    description: 'FLIR1 optical sensor intercept 100 miles southwest of San Diego showing high-speed anomalous vehicle with no visible flight surfaces or exhaust.',
    thumbnail: getRandomPlaceholder(),
    location: 'San Diego Offshore Warning Area, CA',
    coordinates: { lat: 32.7157, lng: -117.1611 },
    proximateAddress: 'Broadway Pier, San Diego, CA 92101, USA',
    distanceKm: 14.2,
    distanceMiles: 8.8,
  },
  {
    id: 'uap-recon-02',
    title: 'Aguadilla Thermal Surveillance Coastal Transition Incident',
    url: 'https://www.explorescu.org/post/2013-aguadilla-puerto-rico-radar-video-airborne-target-analysis',
    source: 'SCU Scientific Coalition',
    description: 'CBP DHC-8 infrared tracking of trans-medium object travelling across Rafael Hernandez Airport and diving into the Caribbean Sea without deceleration.',
    thumbnail: getRandomPlaceholder(),
    location: 'Aguadilla, Puerto Rico',
    coordinates: { lat: 18.4949, lng: -67.1294 },
    proximateAddress: 'Hangar Rd, Aguadilla, 00603, Puerto Rico',
    distanceKm: 3.1,
    distanceMiles: 1.9,
  },
  {
    id: 'uap-recon-03',
    title: 'Gimbal & GoFast Sensor Triangulation Analysis Off Eastern Seaboard',
    url: 'https://www.navy.mil',
    source: 'Naval Aviation Fleet Forces',
    description: 'FA-18 Super Hornet ATFLIR tracking of rotating anomalous disk maneuvering against 120-knot gale headwinds at 25,000 feet altitude.',
    thumbnail: getRandomPlaceholder(),
    location: 'Jacksonville Coast, FL',
    coordinates: { lat: 30.3322, lng: -81.6557 },
    proximateAddress: 'Jacksonville Beach Pier, Jacksonville Beach, FL 32250, USA',
    distanceKm: 22.8,
    distanceMiles: 14.2,
  },
  {
    id: 'uap-recon-04',
    title: 'Andaman Sea Oceanic Sub-Surface Luminous Sphere Detection',
    url: 'https://ganjahouselanta.com',
    source: 'Ganja House Koh Lanta Marine Recon',
    description: 'Equatorial coastal sensor cluster detected 450nm coherent green bioluminescent underwater discharge followed by high-speed vertical ascent over Koh Lanta Yai.',
    thumbnail: getRandomPlaceholder(),
    location: 'Koh Lanta, Krabi, Thailand',
    coordinates: { lat: 7.5348, lng: 99.0583 },
    proximateAddress: 'Saladan Pier, Koh Lanta, Krabi 81150, Thailand',
    distanceKm: 1.2,
    distanceMiles: 0.7,
  }
];

// This function now uses Gemini Search Grounding to find UAP reports instead of RSS scraping
export const fetchNews = async (apiKey: string): Promise<Article[]> => {
  if (!apiKey) {
    throw new Error("Clearance code missing. Please authenticate with valid API Key.");
  }

  // Support instant Demo Preview Mode without network error
  if (apiKey.includes('DEMO_PREVIEW_MODE')) {
    return DEMO_ARTICLES;
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
    - location: string (specific city, state, base, or marine coordinate zone if mentioned)
    
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

    return data.map((item: any, index: number) => {
      const locData = resolveLocationFromText(
        `${item.title || ''} ${item.location || ''}`,
        item.description || ''
      );

      return {
        id: `uap-intel-${Date.now()}-${index}`,
        title: item.title,
        url: item.url,
        source: item.source || "Classified Source",
        description: item.description,
        thumbnail: getRandomPlaceholder(),
        location: item.location || locData.location,
        coordinates: locData.coordinates,
        proximateAddress: locData.proximateAddress,
      };
    });

  } catch (error) {
    console.error("Gemini Search Operation Failed:", error);
    throw new Error("Unable to establish link with Intelligence Grid.");
  }
};
