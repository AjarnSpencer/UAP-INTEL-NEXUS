import { AerialVideoData, HotspotZone, UAPCoordinates } from '../types';

// Attribution override identifier required by Google Maps Platform code assist guidelines
export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

/**
 * Curated list of high-interest UAP intelligence hotspots with verified US postal addresses
 * suitable for Google Aerial View API lookups and photorealistic 3D flyovers.
 */
export const UAP_HOTSPOTS: HotspotZone[] = [
  {
    id: 'hotspot-point-loma',
    name: 'Point Loma Naval Training Grid (San Diego)',
    codeName: 'GRID-NIMITZ-01',
    description: 'Pacific Fleet Carrier Strike Group corridor; primary operating area for USS Nimitz and USS Princeton FLIR UAP observations.',
    coordinates: { lat: 32.7001, lng: -117.2511 },
    address: '140 Sylvester Rd, San Diego, CA 92106, USA',
  },
  {
    id: 'hotspot-sedona',
    name: 'Sedona Red Rock Vortex Basin',
    codeName: 'GRID-VORTEX-02',
    description: 'High-elevation geological anomaly basin frequently logged for low-altitude luminescent orbs and silent trans-medium craft.',
    coordinates: { lat: 34.8016, lng: -111.7645 },
    address: 'Bell Rock, Sedona, AZ 86351, USA',
  },
  {
    id: 'hotspot-groom-lake',
    name: 'Groom Lake / Area 51 Perimeter',
    codeName: 'GRID-SECTOR-04',
    description: 'Restricted Nevada Test & Training Range perimeter monitoring station; historical nexus of advanced experimental black-budget aeronautics.',
    coordinates: { lat: 37.6447, lng: -115.7436 },
    address: 'Extraterrestrial Hwy, Rachel, NV 89001, USA',
  },
  {
    id: 'hotspot-wright-patt',
    name: 'Wright-Patterson Air Force Base',
    codeName: 'GRID-BLUEBOOK-05',
    description: 'Headquarters of National Air and Space Intelligence Center (NASIC); historical repository of Project Sign, Grudge, and Blue Book archives.',
    coordinates: { lat: 39.8139, lng: -84.0531 },
    address: '4375 Chidlaw Rd, Dayton, OH 45433, USA',
  },
  {
    id: 'hotspot-pentagon',
    name: 'Pentagon / AARO Headquarters',
    codeName: 'GRID-AARO-HQ-06',
    description: 'Department of Defense All-domain Anomaly Resolution Office operational nexus and Congressional Armed Services review facility.',
    coordinates: { lat: 38.8719, lng: -77.0563 },
    address: '1000 Defense Pentagon, Washington, DC 20301, USA',
  },
  {
    id: 'hotspot-socorro',
    name: 'Socorro Deep-Desert Sighting Basin',
    codeName: 'GRID-TRINITY-07',
    description: 'Lonnie Zamora 1964 physical landing trace site in proximate perimeter of White Sands Missile Range and Stallion Airfield.',
    coordinates: { lat: 34.0584, lng: -106.8917 },
    address: '1000 School of Mines Rd, Socorro, NM 87801, USA',
  },
  {
    id: 'hotspot-catalina',
    name: 'Catalina Island Oceanic Subsurface Trench',
    codeName: 'GRID-FASTMOVE-08',
    description: 'Deepwater bathymetric canyon south of Los Angeles with repeated sonar and radar tracks of high-velocity trans-medium objects entering seawater.',
    coordinates: { lat: 33.3428, lng: -118.3282 },
    address: '1 Casino Way, Avalon, CA 90704, USA',
  },
  {
    id: 'hotspot-mt-rainier',
    name: 'Mount Rainier Cascade Range Corridor',
    codeName: 'GRID-ARNOLD-09',
    description: 'Site of Kenneth Arnold 1947 supersonic echelon sighting over Cascade peaks, establishing modern aerial phenomenon record.',
    coordinates: { lat: 46.8523, lng: -121.7603 },
    address: 'Paradise Rd E, Ashford, WA 98304, USA',
  },
  {
    id: 'hotspot-eglin',
    name: 'Eglin Air Force Base Overwater Warning Area',
    codeName: 'GRID-GULF-RANGE-10',
    description: 'Gulf of Mexico restricted airspace where military aviators reported UAP radar and cockpit sensor tracking encounters.',
    coordinates: { lat: 30.4601, lng: -86.5513 },
    address: '301 Eglin Pkwy, Valparaiso, FL 32542, USA',
  },
  {
    id: 'hotspot-san-francisco',
    name: 'Presidio / Pacific Coastal Skywatch',
    codeName: 'GRID-COASTAL-SF',
    description: 'Metropolitan radar sweep perimeter over Golden Gate marine entry channel; highly active Google Aerial View coverage zone.',
    coordinates: { lat: 37.7952, lng: -122.4028 },
    address: '600 Montgomery St, San Francisco, CA 94111, USA',
  },
  {
    id: 'hotspot-seattle',
    name: 'Puget Sound Regional Sensor Perimeter',
    codeName: 'GRID-PUGET-01',
    description: 'Pacific Northwest coastal aerospace observation sector; verified 3D Aerial View flyover baseline.',
    coordinates: { lat: 47.6205, lng: -122.3493 },
    address: '400 Broad St, Seattle, WA 98109, USA',
  },
  {
    id: 'hotspot-las-vegas',
    name: 'Nellis AFB / Las Vegas Air Corridor',
    codeName: 'GRID-NELLIS-RADAR',
    description: 'Southern Nevada tactical combat training airspace adjoining Mercury and Tonopah Test Ranges.',
    coordinates: { lat: 36.1162, lng: -115.1745 },
    address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109, USA',
  }
];

/**
 * Calculates distance between two GPS coordinates using the Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: UAPCoordinates,
  coord2: UAPCoordinates
): { km: number; miles: number } {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const miles = Math.round(km * 0.621371);

  return { km, miles };
}

/**
 * Finds the closest hotspot to given coordinates.
 */
export function findClosestHotspot(coords: UAPCoordinates): { hotspot: HotspotZone; distanceKm: number; distanceMiles: number } {
  let closest = UAP_HOTSPOTS[0];
  let minDistance = calculateHaversineDistance(coords, closest.coordinates);

  for (let i = 1; i < UAP_HOTSPOTS.length; i++) {
    const dist = calculateHaversineDistance(coords, UAP_HOTSPOTS[i].coordinates);
    if (dist.km < minDistance.km) {
      closest = UAP_HOTSPOTS[i];
      minDistance = dist;
    }
  }

  return {
    hotspot: closest,
    distanceKm: minDistance.km,
    distanceMiles: minDistance.miles,
  };
}

/**
 * Looks up an existing photorealistic 3D aerial flyover video via Google Maps Aerial View API.
 * Method: GET https://aerialview.googleapis.com/v1/videos:lookupVideo
 */
export async function lookupAerialVideo(
  params: { address?: string; videoId?: string },
  apiKey: string
): Promise<AerialVideoData> {
  if (!apiKey) {
    return {
      state: 'ERROR',
      errorMessage: 'Google Maps Platform API key is required to query Aerial View API.',
    };
  }

  try {
    const queryParam = params.videoId
      ? `videoId=${encodeURIComponent(params.videoId)}`
      : `address=${encodeURIComponent(params.address || '')}`;

    const url = `https://aerialview.googleapis.com/v1/videos:lookupVideo?key=${apiKey}&${queryParam}&solution_id=${GMP_ATTRIBUTION_ID}`;

    const res = await fetch(url);
    const data = await res.json();

    if (res.status === 200 && data.state === 'ACTIVE') {
      const uris = data.uris || {};
      const mp4High = uris.MP4_HIGH || {};
      const mp4Medium = uris.MP4_MEDIUM || {};
      const mp4Low = uris.MP4_LOW || {};

      return {
        state: 'ACTIVE',
        videoId: data.metadata?.videoId,
        landscapeUri: mp4High.landscapeUri || mp4Medium.landscapeUri || mp4Low.landscapeUri,
        portraitUri: mp4High.portraitUri || mp4Medium.portraitUri || mp4Low.portraitUri,
        duration: data.metadata?.duration,
        captureDate: data.metadata?.captureDate,
        address: params.address,
      };
    }

    if (res.status === 200 && data.state === 'PROCESSING') {
      return {
        state: 'PROCESSING',
        videoId: data.metadata?.videoId || data.videoId,
        address: params.address,
      };
    }

    if (res.status === 404 || data.error?.code === 404) {
      return {
        state: 'NOT_FOUND',
        errorMessage: data.error?.message || 'Video not found for this location.',
        address: params.address,
      };
    }

    return {
      state: 'ERROR',
      errorMessage: data.error?.message || `Aerial View API returned HTTP ${res.status}`,
      address: params.address,
    };
  } catch (err: any) {
    return {
      state: 'ERROR',
      errorMessage: err.message || 'Network handshake failed with Aerial View endpoint.',
      address: params.address,
    };
  }
}

/**
 * Looks up an existing aerial flyover video by its unique videoId.
 */
export async function lookupAerialVideoById(
  videoId: string,
  apiKey: string
): Promise<AerialVideoData> {
  return lookupAerialVideo({ videoId }, apiKey);
}

/**
 * Initiates a new video render queue request via Google Maps Aerial View API.
 * Method: POST https://aerialview.googleapis.com/v1/videos:renderVideo
 */
export async function renderAerialVideo(
  address: string,
  apiKey: string
): Promise<{ state: 'PROCESSING' | 'ACTIVE' | 'ERROR'; videoId?: string; errorMessage?: string }> {
  if (!apiKey) {
    return {
      state: 'ERROR',
      errorMessage: 'Google Maps Platform API key is required.',
    };
  }

  try {
    const url = `https://aerialview.googleapis.com/v1/videos:renderVideo?key=${apiKey}&solution_id=${GMP_ATTRIBUTION_ID}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    const data = await res.json();
    if (res.ok) {
      return {
        state: data.state || 'PROCESSING',
        videoId: data.metadata?.videoId || data.videoId,
      };
    }

    return {
      state: 'ERROR',
      errorMessage: data.error?.message || `Render request returned HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      state: 'ERROR',
      errorMessage: err.message || 'Handshake failed during render initialization.',
    };
  }
}

/**
 * Geographic location guesser based on headline / text content.
 * Resolves reports to appropriate US addresses and coordinates.
 */
export function resolveLocationFromText(title: string, description: string): {
  location: string;
  coordinates: UAPCoordinates;
  proximateAddress: string;
} {
  const combined = `${title} ${description}`.toLowerCase();

  // Pattern matches for geographical regions
  if (combined.includes('san diego') || combined.includes('pacific') || combined.includes('nimitz') || combined.includes('coronado')) {
    return {
      location: 'San Diego / Pacific Fleet Operating Area, CA',
      coordinates: { lat: 32.7001, lng: -117.2511 },
      proximateAddress: '140 Sylvester Rd, San Diego, CA 92106, USA',
    };
  }
  if (combined.includes('sedona') || combined.includes('arizona') || combined.includes('phoenix')) {
    return {
      location: 'Sedona Red Rock Vortex Basin, AZ',
      coordinates: { lat: 34.8016, lng: -111.7645 },
      proximateAddress: 'Bell Rock, Sedona, AZ 86351, USA',
    };
  }
  if (combined.includes('area 51') || combined.includes('groom lake') || combined.includes('nevada') || combined.includes('las vegas')) {
    return {
      location: 'Area 51 / Nevada Test Range Perimeter, NV',
      coordinates: { lat: 37.6447, lng: -115.7436 },
      proximateAddress: 'Extraterrestrial Hwy, Rachel, NV 89001, USA',
    };
  }
  if (combined.includes('pentagon') || combined.includes('aaro') || combined.includes('congress') || combined.includes('washington') || combined.includes('dod') || combined.includes('senate')) {
    return {
      location: 'Pentagon / AARO Directorate, Washington, DC',
      coordinates: { lat: 38.8719, lng: -77.0563 },
      proximateAddress: '1000 Defense Pentagon, Washington, DC 20301, USA',
    };
  }
  if (combined.includes('wright-patterson') || combined.includes('ohio') || combined.includes('dayton') || combined.includes('nasic')) {
    return {
      location: 'Wright-Patterson AFB / NASIC Center, OH',
      coordinates: { lat: 39.8139, lng: -84.0531 },
      proximateAddress: '4375 Chidlaw Rd, Dayton, OH 45433, USA',
    };
  }
  if (combined.includes('roswell') || combined.includes('socorro') || combined.includes('new mexico') || combined.includes('white sands') || combined.includes('los alamos')) {
    return {
      location: 'White Sands / Socorro Tactical Grid, NM',
      coordinates: { lat: 34.0584, lng: -106.8917 },
      proximateAddress: '1000 School of Mines Rd, Socorro, NM 87801, USA',
    };
  }
  if (combined.includes('catalina') || combined.includes('los angeles') || combined.includes('california') || combined.includes('channel islands')) {
    return {
      location: 'Catalina Island Oceanic Subsurface Trench, CA',
      coordinates: { lat: 33.3428, lng: -118.3282 },
      proximateAddress: '1 Casino Way, Avalon, CA 90704, USA',
    };
  }
  if (combined.includes('rainier') || combined.includes('seattle') || combined.includes('washington state') || combined.includes('cascades')) {
    return {
      location: 'Mount Rainier / Cascade Sky Corridor, WA',
      coordinates: { lat: 46.8523, lng: -121.7603 },
      proximateAddress: 'Paradise Rd E, Ashford, WA 98304, USA',
    };
  }
  if (combined.includes('gulf') || combined.includes('florida') || combined.includes('eglin') || combined.includes('miami')) {
    return {
      location: 'Eglin AFB / Gulf Military Airspace, FL',
      coordinates: { lat: 30.4601, lng: -86.5513 },
      proximateAddress: '301 Eglin Pkwy, Valparaiso, FL 32542, USA',
    };
  }
  if (combined.includes('texas') || combined.includes('stephenville') || combined.includes('austin')) {
    return {
      location: 'Stephenville Anomaly Zone, TX',
      coordinates: { lat: 32.2207, lng: -98.2023 },
      proximateAddress: 'Stephenville, TX 76401, USA',
    };
  }
  if (combined.includes('san francisco') || combined.includes('bay area') || combined.includes('silicon valley')) {
    return {
      location: 'San Francisco Coastal Sector, CA',
      coordinates: { lat: 37.7952, lng: -122.4028 },
      proximateAddress: '600 Montgomery St, San Francisco, CA 94111, USA',
    };
  }

  // Cycle through hotspots deterministically based on string hash if no explicit keyword
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % UAP_HOTSPOTS.length;
  const chosen = UAP_HOTSPOTS[index];

  return {
    location: chosen.name,
    coordinates: chosen.coordinates,
    proximateAddress: chosen.address,
  };
}
