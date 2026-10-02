import { Article, UAPCoordinates } from '../types';

export interface GoogleDocFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface ExportDossierParams {
  article: Article;
  briefingContent: string;
  reporterStyle: string;
  voiceId: string;
  coordinates?: UAPCoordinates;
  visualReconstructionUrl?: string | null;
}

/**
 * Creates a classified intelligence dossier in Google Docs
 */
export async function createUAPDossierDoc(
  accessToken: string,
  params: ExportDossierParams
): Promise<{ documentId: string; documentUrl: string; title: string }> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const cleanTitle = `[UAP INTEL] ${params.article.title.substring(0, 50)}`;

  // Step 1: Create a new blank Google Document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: cleanTitle,
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Failed to create Google Doc (Status ${createRes.status})`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // Step 2: Build formatted text to insert
  const textContent = [
    `UAP INTEL NEXUS — CLASSIFIED INTELLIGENCE DOSSIER\n`,
    `SECURITY CLEARANCE: TOP SECRET // COMPARTMENTED // LEVEL 5\n`,
    `RECORD_ID: ${params.article.id}\n`,
    `GENERATED_AT: ${timestamp}\n`,
    `ANALYST_STATION: AJARN SPENCER LITTLEWOOD (KOH LANTA RECON)\n`,
    `\n`,
    `============================================================\n`,
    `INCIDENT IDENTIFICATION\n`,
    `============================================================\n`,
    `Title: ${params.article.title}\n`,
    `Source Feed: ${params.article.source}\n`,
    `Target Grid Sector: ${params.article.location || 'Classified / Undisclosed'}\n`,
    params.coordinates ? `Coordinates: ${params.coordinates.lat.toFixed(4)}° N/S, ${params.coordinates.lng.toFixed(4)}° E/W\n` : '',
    params.article.proximateAddress ? `Proximate Land Address: ${params.article.proximateAddress}\n` : '',
    params.article.distanceKm ? `Radar Distance: ${params.article.distanceKm} km (${params.article.distanceMiles} miles)\n` : '',
    `Reference Link: ${params.article.url}\n`,
    `\n`,
    `============================================================\n`,
    `ANALYSIS MATRIX & TELEMETRY FOOTPRINT\n`,
    `============================================================\n`,
    `Briefing Mode: ${params.reporterStyle.toUpperCase()} NARRATIVE\n`,
    `Synthesized Audio Persona: ${params.voiceId} (Journey Architecture)\n`,
    `Sensor Band: 1420.4 MHz (Hydrogen Line Carrier)\n`,
    `Encryption Protocol: AES-256-GCM QUANTUM RESISTANT\n`,
    `Satellite Uplink: SAT_RECON_ALPHA_09 / UAP NEXUS GRID\n`,
    `\n`,
    `============================================================\n`,
    `DECLASSIFIED BRIEFING & SYNTHESIZED INTEL\n`,
    `============================================================\n`,
    `${params.briefingContent}\n`,
    `\n`,
    `============================================================\n`,
    `PRIMARY WITNESS / MEDIA SYNOPSIS\n`,
    `============================================================\n`,
    `${params.article.description || 'No raw witness remarks provided.'}\n`,
    `\n`,
    `------------------------------------------------------------\n`,
    `Document automatically dispatched via UAP Intel Nexus Google Workspace Gateway.\n`
  ].join('');

  // Step 3: Insert text into the Google Doc via batchUpdate
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: textContent,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    console.warn('Text insert returned non-200, document created but formatting was partial', await updateRes.text());
  }

  return {
    documentId,
    documentUrl,
    title: cleanTitle,
  };
}

/**
 * List recent Google Docs from Drive matching UAP intel or all Docs
 */
export async function listUAPDossierDocs(accessToken: string): Promise<GoogleDocFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.document' and trashed=false");
  const fields = encodeURIComponent("files(id, name, createdTime, modifiedTime, webViewLink, iconLink)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime desc&pageSize=15`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch files from Google Drive (Status ${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Appends a field update or tactical note to an existing Google Doc
 */
export async function appendTacticalNoteToDoc(
  accessToken: string,
  documentId: string,
  noteText: string
): Promise<void> {
  // First retrieve doc end index
  const getRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getRes.ok) {
    throw new Error(`Failed to load document info (Status ${getRes.status})`);
  }

  const doc = await getRes.json();
  const body = doc.body;
  const content = body.content || [];
  const lastElement = content[content.length - 1];
  const endIndex = lastElement ? Math.max(1, lastElement.endIndex - 1) : 1;

  const formattedNote = `\n\n[TACTICAL UPDATE - ${new Date().toISOString()}]\n${noteText}\n`;

  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: endIndex,
            },
            text: formattedNote,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const errBody = await updateRes.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || 'Failed to append note to document');
  }
}

/**
 * Delete a Google Doc from Drive (requires mandatory user confirmation)
 */
export async function deleteDossierDoc(
  accessToken: string,
  documentId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to delete file (Status ${res.status})`);
  }
}
