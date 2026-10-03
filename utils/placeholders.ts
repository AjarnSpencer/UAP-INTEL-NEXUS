/**
 * High-fidelity sector-specific satellite reconnaissance image generator.
 * Generates custom, distinct top-down orbital reconnaissance satellite captures
 * tailored to each operational zone with authentic terrain photorealism,
 * geographic landforms, coastal bathymetry, mountain relief, and NRO KH-11 telemetry.
 */

export function generateSectorSatReconCanvas(
  sectorName: string,
  lat: number = 37.2431,
  lng: number = -115.793
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const lower = sectorName.toLowerCase();
  const isOcean =
    lower.includes('pacific') ||
    lower.includes('andaman') ||
    lower.includes('sea') ||
    lower.includes('coast') ||
    lower.includes('ocean') ||
    lower.includes('water') ||
    lower.includes('diego') ||
    lower.includes('aguadilla') ||
    lower.includes('caribbean');
  const isDesert =
    lower.includes('roswell') ||
    lower.includes('area 51') ||
    lower.includes('vegas') ||
    lower.includes('sedona') ||
    lower.includes('nevada') ||
    lower.includes('rachel') ||
    lower.includes('hwy');

  // 1. Realistic Satellite Orthorectified Terrain Shading
  if (isOcean) {
    // Deep Ocean Bathymetric Gradients with Coastal Shelf
    const oceanGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    oceanGrad.addColorStop(0, '#02182b');
    oceanGrad.addColorStop(0.35, '#053154');
    oceanGrad.addColorStop(0.65, '#02243d');
    oceanGrad.addColorStop(1, '#01121f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Coastal shelf & reef turquoise banks
    ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.72, canvas.height * 0.48, 380, 220, -0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.75, canvas.height * 0.46, 260, 140, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Coastline landmass
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.7, 0);
    ctx.bezierCurveTo(canvas.width * 0.78, canvas.height * 0.3, canvas.width * 0.65, canvas.height * 0.7, canvas.width * 0.85, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, 0);
    ctx.closePath();
    ctx.fill();

    // Coastal sand fringe
    ctx.strokeStyle = 'rgba(217, 180, 130, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (isDesert) {
    // Realistic Desert Bedrock & Alluvial Fan Shading
    const desertGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    desertGrad.addColorStop(0, '#caa375');
    desertGrad.addColorStop(0.3, '#b58b58');
    desertGrad.addColorStop(0.65, '#996f3e');
    desertGrad.addColorStop(1, '#735028');
    ctx.fillStyle = desertGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dry salt flat / playa lake bed (Groom Lake / dry basin)
    ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.42, canvas.height * 0.48, 240, 120, 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Rugged mountain ridges with realistic cast shadows
    ctx.strokeStyle = 'rgba(67, 43, 20, 0.7)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.15, 0);
    ctx.lineTo(canvas.width * 0.28, canvas.height * 0.5);
    ctx.lineTo(canvas.width * 0.22, canvas.height);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(67, 43, 20, 0.75)';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.72, 0);
    ctx.lineTo(canvas.width * 0.82, canvas.height * 0.4);
    ctx.lineTo(canvas.width * 0.76, canvas.height);
    ctx.stroke();

    // Restricted access roads / Extraterrestrial Highway
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.65);
    ctx.lineTo(canvas.width * 0.52, canvas.height * 0.42);
    ctx.lineTo(canvas.width, canvas.height * 0.38);
    ctx.stroke();
  } else {
    // Temperate forest canopy & agricultural matrix
    const forestGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    forestGrad.addColorStop(0, '#1c3d26');
    forestGrad.addColorStop(0.4, '#265434');
    forestGrad.addColorStop(0.8, '#14301d');
    forestGrad.addColorStop(1, '#0c2113');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // River corridor
    ctx.strokeStyle = 'rgba(14, 116, 144, 0.75)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.3);
    ctx.bezierCurveTo(canvas.width * 0.35, canvas.height * 0.55, canvas.width * 0.65, canvas.height * 0.2, canvas.width, canvas.height * 0.45);
    ctx.stroke();
  }

  // 2. High-Altitude Atmospheric Cirrus Haze
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.3, canvas.height * 0.25, 220, 70, 0.3, 0, Math.PI * 2);
  ctx.ellipse(canvas.width * 0.78, canvas.height * 0.72, 280, 85, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // 3. Fine Military Optical Satellite Coordinate Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 1;
  const gridStep = 100;
  for (let x = gridStep; x < canvas.width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = gridStep; y < canvas.height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 4. Incident Target Sector Reticle
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Discrete thermal anomaly indicator
  const heatGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 60);
  heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
  heatGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
  heatGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
  ctx.fill();

  // Fine crosshair box
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(centerX - 40, centerY - 40, 80, 80);

  ctx.beginPath();
  ctx.moveTo(centerX - 65, centerY);
  ctx.lineTo(centerX - 42, centerY);
  ctx.moveTo(centerX + 42, centerY);
  ctx.lineTo(centerX + 65, centerY);
  ctx.moveTo(centerX, centerY - 65);
  ctx.lineTo(centerX, centerY - 42);
  ctx.moveTo(centerX, centerY + 42);
  ctx.lineTo(centerX, centerY + 65);
  ctx.stroke();

  // 5. Authentic Classified Telemetry Banners
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.fillRect(0, 0, canvas.width, 38);
  ctx.fillRect(0, canvas.height - 32, canvas.width, 32);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`TOP SECRET // NRO KH-11 ORBITAL PASS // SECTOR: ${sectorName.toUpperCase()}`, 20, 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText(
    `COORDS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W // GSD: 0.15M/PX // MULTISPECTRAL OPTICAL`,
    20,
    canvas.height - 11
  );

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`THERMAL ANOMALY: CONFIRMED (ΔT +4.2K)`, canvas.width - 320, 24);

  return canvas.toDataURL('image/jpeg', 0.94);
}

export const getRandomPlaceholder = (
  title: string = 'Sector Recon',
  lat?: number,
  lng?: number
): string => {
  return generateSectorSatReconCanvas(title, lat || 34.0, lng || -115.0);
};
