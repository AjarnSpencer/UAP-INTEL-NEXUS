import { HotspotZone, UAPCoordinates } from '../types';

/**
 * Strategic UAP Hotspots & Defense Monitoring Sectors with verified geographic anchors.
 */
export const UAP_HOTSPOTS: HotspotZone[] = [
  {
    id: 'hotspot-area51',
    name: 'Groom Lake / Area 51 Restricted Corridor',
    codeName: 'SECTOR-EXT-51',
    description: 'Restricted military test facility airspace; primary historic hotspot for unexplained high-altitude supersonic radar tracks.',
    coordinates: { lat: 37.2431, lng: -115.793 },
    address: 'Extraterrestrial Hwy, Rachel, NV 89001, USA',
  },
  {
    id: 'hotspot-san-diego',
    name: 'San Diego Fleet Tactical Exercise Sector (USS Nimitz FLIR)',
    codeName: 'GRID-NIMITZ-PACIFIC',
    description: 'Pacific Ocean maritime patrol zone where the 2004 USS Nimitz Carrier Strike Group tracked the Tic-Tac anomaly on AN/SPY-1B radar.',
    coordinates: { lat: 32.7157, lng: -117.1611 },
    address: '140 Sylvester Rd, San Diego, CA 92106, USA',
  },
  {
    id: 'hotspot-sedona',
    name: 'Sedona Red Rock Vortex Aerospace Corridor',
    codeName: 'GRID-SEDONA-VORTEX',
    description: 'High-density civilian and infrared observation corridor for silent luminous spherical UAP formations.',
    coordinates: { lat: 34.8697, lng: -111.761 },
    address: 'Bell Rock, Sedona, AZ 86351, USA',
  },
  {
    id: 'hotspot-roswell',
    name: 'Roswell Military Air Field / Debris Field Sector',
    codeName: 'SECTOR-ROSWELL-47',
    description: 'Historic 1947 509th Bombardment Group recovery sector and radar monitoring perimeter.',
    coordinates: { lat: 33.3943, lng: -104.523 },
    address: '100 N Main St, Roswell, NM 88203, USA',
  },
  {
    id: 'hotspot-rendlesham',
    name: 'RAF Bentwaters / Rendlesham Forest Perimeter',
    codeName: 'SECTOR-RENDLESHAM-UK',
    description: 'NATO twin-base radiation anomaly and physical craft landing beacon site.',
    coordinates: { lat: 52.0833, lng: 1.4333 },
    address: 'Rendlesham Forest, Woodbridge IP12 3NF, UK',
  },
  {
    id: 'hotspot-san-francisco',
    name: 'Transamerica Sector / San Francisco Bay',
    codeName: 'GRID-SF-BAY-01',
    description: 'Coastal urban surveillance grid with multi-angle high-resolution optical tracking.',
    coordinates: { lat: 37.7952, lng: -122.4028 },
    address: '600 Montgomery St, San Francisco, CA 94111, USA',
  },
  {
    id: 'hotspot-seattle',
    name: 'Puget Sound Regional Sensor Perimeter',
    codeName: 'GRID-PUGET-01',
    description: 'Pacific Northwest coastal aerospace observation sector; verified optical and radar baseline.',
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
 * Geographic location guesser based on headline / text content.
 * Resolves reports to appropriate coordinates and tactical sector descriptions.
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
  if (combined.includes('roswell') || combined.includes('new mexico') || combined.includes('white sands')) {
    return {
      location: 'Chaves County / Roswell Range, NM',
      coordinates: { lat: 33.3943, lng: -104.523 },
      proximateAddress: '100 N Main St, Roswell, NM 88203, USA',
    };
  }
  if (combined.includes('rendlesham') || combined.includes('bentwaters') || combined.includes('woodbridge') || combined.includes('uk') || combined.includes('suffolk')) {
    return {
      location: 'Rendlesham Forest / RAF Bentwaters, UK',
      coordinates: { lat: 52.0833, lng: 1.4333 },
      proximateAddress: 'Rendlesham Forest, Woodbridge IP12 3NF, UK',
    };
  }
  if (combined.includes('las vegas') || combined.includes('nellis') || combined.includes('creech')) {
    return {
      location: 'Nellis Air Force Base Range Complex, NV',
      coordinates: { lat: 36.2362, lng: -115.0343 },
      proximateAddress: '3570 S Las Vegas Blvd, Las Vegas, NV 89109, USA',
    };
  }
  if (combined.includes('andaman') || combined.includes('oceanic') || combined.includes('lanta') || combined.includes('thailand') || combined.includes('maritime')) {
    return {
      location: 'Andaman Sea Continental Shelf Basin',
      coordinates: { lat: 7.5583, lng: 99.0436 },
      proximateAddress: 'Andaman Sea Maritime Reconnaissance Grid, 81150, Thailand',
    };
  }

  if (combined.includes('france') || combined.includes('geipan') || combined.includes('toulouse') || combined.includes('cnes')) {
    return {
      location: 'GEIPAN Aerospace Surveillance Sector, Toulouse, France',
      coordinates: { lat: 43.5627, lng: 1.4828 },
      proximateAddress: '18 Avenue Edouard Belin, 31400 Toulouse, France',
    };
  }
  if (combined.includes('brazil') || combined.includes('colares') || combined.includes('brasilia') || combined.includes('varginha') || combined.includes('arquivo nacional')) {
    return {
      location: 'Colares Maritime Coastal Vector / Brasília Air Defense Sector, Brazil',
      coordinates: { lat: -0.9333, lng: -48.2833 },
      proximateAddress: 'Praça do Pescador, Colares - PA, 68785-000, Brazil',
    };
  }
  if (combined.includes('mexico') || combined.includes('popocat') || combined.includes('afac') || combined.includes('seneam')) {
    return {
      location: 'Popocatépetl Volcanic Aerospace Corridor, Puebla, Mexico',
      coordinates: { lat: 19.0224, lng: -98.6279 },
      proximateAddress: 'Parque Nacional Iztaccíhuatl-Popocatépetl, Mexico',
    };
  }
  if (combined.includes('chile') || combined.includes('cefaa') || combined.includes('dgac') || combined.includes('santiago') || combined.includes('andes')) {
    return {
      location: 'CEFAA Andean Trans-Medium Sector, Santiago, Chile',
      coordinates: { lat: -33.4489, lng: -70.6693 },
      proximateAddress: 'Av. Providencia 2008, Santiago, Providencia, Región Metropolitana, Chile',
    };
  }
  if (combined.includes('japan') || combined.includes('tokyo') || combined.includes('fukushima') || combined.includes('okinawa') || combined.includes('defense ministry')) {
    return {
      location: 'Ministry of Defense UAP Tracking Corridor, Tokyo / Honshu, Japan',
      coordinates: { lat: 35.6938, lng: 139.7289 },
      proximateAddress: 'Ichigayahonmuracho, Shinjuku City, Tokyo 162-0845, Japan',
    };
  }
  if (combined.includes('korea') || combined.includes('seoul') || combined.includes('mnd')) {
    return {
      location: 'DMZ Aerospace Surveillance Vector, Seoul, South Korea',
      coordinates: { lat: 37.5326, lng: 126.9745 },
      proximateAddress: 'Yongsan-gu, Seoul, South Korea',
    };
  }
  if (combined.includes('india') || combined.includes('ladakh') || combined.includes('himalaya') || combined.includes('delhi')) {
    return {
      location: 'High-Altitude Himalayan Radar Grid, Ladakh, India',
      coordinates: { lat: 34.1526, lng: 77.5771 },
      proximateAddress: 'Leh Airfield Sector, Ladakh 194101, India',
    };
  }
  if (combined.includes('australia') || combined.includes('woomera') || combined.includes('pine gap') || combined.includes('canberra')) {
    return {
      location: 'Pine Gap / Woomera Aerospace Range, Northern Territory, Australia',
      coordinates: { lat: -23.7986, lng: 133.7374 },
      proximateAddress: 'Hatfield Hwy, Alice Springs NT 0870, Australia',
    };
  }
  if (combined.includes('new zealand') || combined.includes('kaikoura') || combined.includes('wellington')) {
    return {
      location: 'Kaikoura Maritime Observation Vector, South Island, New Zealand',
      coordinates: { lat: -42.4000, lng: 173.6833 },
      proximateAddress: 'Kaikoura Coastal Sector, Canterbury 7300, New Zealand',
    };
  }
  if (combined.includes('aguadilla') || combined.includes('puerto rico')) {
    return {
      location: 'Aguadilla Coastal Transition Sector, Puerto Rico',
      coordinates: { lat: 18.4949, lng: -67.1294 },
      proximateAddress: 'Rafael Hernandez Airport, Aguadilla 00603, Puerto Rico',
    };
  }

  // Default tactical epicenter (Rachel / Area 51 / Extraterrestrial Hwy)
  return {
    location: 'Groom Lake / Rachel Radar Perimeter, NV',
    coordinates: { lat: 37.6447, lng: -115.7441 },
    proximateAddress: 'Extraterrestrial Hwy, Rachel, NV 89001, USA',
  };
}
