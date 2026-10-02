# UAP INTEL NEXUS — TACTICAL RECONNAISSANCE & SENSORY COMMAND

<p align="center">
  <img src="public/banner.svg" alt="UAP Intel Nexus — Tactical Sighting & Reconnaissance Command" width="100%" style="border-radius: 12px; border: 1px solid #16a34a;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Classification-TOP%20SECRET%20%2F%2F%20NEXUS-red?style=for-the-badge&logo=security" alt="Top Secret Clearance" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google%20Maps-Aerial%20View%203D-4285F4?style=for-the-badge&logo=googlemaps" alt="Google Maps Platform" />
  <img src="https://img.shields.io/badge/Google%20Workspace-Docs%20%26%20Drive-34A853?style=for-the-badge&logo=googledocs" alt="Google Workspace" />
  <img src="https://img.shields.io/badge/BYOK%20Security-100%25%20Client--Side%20Isolation-10b981?style=for-the-badge&logo=shield" alt="100% BYOK Isolation" />
</p>

---

## 🛰️ EXECUTIVE OVERVIEW

**UAP INTEL NEXUS** is a mission-critical tactical intelligence workstation and declassified reconnaissance platform engineered for investigative researchers, defense analysts, and aerial phenomena specialists. Developed under the supervision of **Ajarn Spencer Littlewood**, the system aggregates global Unidentified Anomalous Phenomena (UAP) sightings, military ATFLIR/optical sensor telemetry, radar intercepts, and declassified incident dossiers into a single, high-fidelity operations console.

By fusing real-time **Google Maps Platform** geospatial tracking, **Google Maps Aerial View API** cinematic 3D flyovers, **Google Workspace Google Docs** classified briefing exports, and multimodal **Google Gemini** tactical reasoning with **Journey Voice Synthesis**, UAP Intel Nexus bridges raw sighting coordinates with deep forensic dossiers.

---

## 🔐 INVESTIGATOR ACCESS & BYOK (BRING YOUR OWN KEY) POLICY

### 100% Client-Side Cryptographic Isolation
To preserve strict operational security, prevent cross-investigator telemetry surveillance, and eliminate intermediary server exposure, UAP Intel Nexus operates on a strict **Bring Your Own Key (BYOK)** client-side sandbox architecture:

1. **Local Browser Isolation (`localStorage`)**: Your Google Gemini API Key and Google Workspace OAuth access tokens are preserved solely within your browser session sandbox. Credentials are never sent, logged, or proxied through any external backend server.
2. **Autonomous Dossier Generation & Audio Synthesis**: Multi-persona tactical analyses, declassified search grounding, and Journey TTS voice generation are executed directly between your browser and Google's AI endpoints using your personal quota.
3. **Instant Revocation & Session Purge**: A single click on the `REVOKE` command header button instantly cleanses all cryptographic keys, cache items, and session tokens from local browser storage.
4. **Zero-Config Demo Preview Mode**: For rapid briefing evaluations without an immediate API key, an integrated Demo Preview mode allows analysts to inspect declassified historical incidents (USS Nimitz FLIR1, Aguadilla CBP thermal intercept, Gimbal/GoFast tracking, and Andaman maritime anomalies).

👉 **Investigator Key Provisioning Console**:
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) *(Open in a new tab to generate your personal Gemini API key)*.

---

## ⚡ COMPLETE FEATURE BREAKDOWN

### 1. Tactical Geospatial Radar & Location Grid (`components/UAPTacticalMap.tsx`)
- **Real-Time Incident Plotting**: Interactive dark-mode vector radar grid centering worldwide UAP sightings without third-party paid map dependencies.
- **Zoomed Radar Inspector (2X - 14X)**: Dynamic zoom scale, concentric range rings (scaled in kilometers), azimuth 360° degree perimeter marks, and real-time center coordinate readout.
- **Tri-Mode Grid Switching**:
  - **Hybrid Grid**: Satellite terrain composite with glowing tactical coordinate grid, sector outlines, and illuminated contact blips.
  - **Satellite Grid**: High-resolution photorealistic Earth orbital imagery with range rings and targeting reticle.
  - **Vector Grid**: High-contrast dark cyber military vector matrix (deep black with glowing emerald green coordinate grid lines, range rings, and azimuth marks).
- **Interactive Radar Blip Pins**: Pulsing contact nodes color-coded by status (selected target in red, closest proximate vector in yellow, active contacts in green) with hover inspect cards and floating Locked Target Recon panel.
- **Geodesic Distance & Sector Triangulation**: Live distance calculation in km/miles to any reference point or GPS location.
- **Hotspot Sectors Quick-Jumper**: Immediate 1-click re-centering to key sectors (Groom Lake / Area 51, San Diego Nimitz, Sedona Vortex, Roswell, Rendlesham, etc.).

### 2. Nano Banana Pro Photographic Cinematic Image Generator (`services/geminiService.ts`)
- **Multi-Model Cascade**: Powered by **Nano Banana Pro (`gemini-3-pro-image`)** with automatic fallback cascade to `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `imagen-3.0-generate-002`, and procedural forensic simulation.
- **35mm Optical Photographic Surveillance Style**: Synthesizes highly realistic photographic frames matching the reported anomalous vehicle's morphology, ionization glow, atmospheric scattering, and eyewitness lighting conditions.
- **Direct Asset Downloads**: 1-click buttons to download the generated photographic image (`.png`) and the satellite reconnaissance image (`.jpg`).

### 3. Multimodal Gemini Tactical Intelligence Dossier Engine
- **Search-Grounded Intelligence**: Live querying with Google Search Grounding to aggregate newly declassified releases and maritime advisories.
- **Four Distinct Operational Persona Briefings**:
  - **Investigative Journalism**: Objective corroboration, public disclosure tracking, and chain-of-custody analysis.
  - **Military Tactical**: Sensor triangulation, radar cross-section assessment, electronic warfare jamming analysis, and flight performance parameters.
  - **Scientific Analytical**: Kinematic physics modeling, atmospheric optics, trans-medium hydrodynamics, and sensor artifact elimination.
  - **Whistleblower / Black-Budget**: Deep-state compartmentalization, special access programs (SAP), reverse-engineering speculation, and secrecy enforcement history.

### 4. Neural Audio Briefings & Voice Synthesis (`services/geminiService.ts`)
- **Full Narrative Vocalization**: Seamless speech generation without arbitrary 800-character cutoffs or screeching double-headers.
- **Journey Neural Voices**: High-fidelity speech generation featuring eight distinct military and briefing personas (`Fenrir`, `Kore`, `Charon`, `Aoede`, `Zephyr`, `Puck`, `Leda`, `Orus`).
- **Real-Time Audio Player**: In-browser waveform playback controls with scrubbing, voice selector, speed tuning, and 1-click `.wav` mission download.

### 5. Verified Real Markdown & PDF Dossier Downloads
- **Download `.MD`**: Generates and downloads a clean, verified Markdown document (`.md`) formatted with classification blocks, executive summaries, coordinates, and forensic briefing text.
- **Download `.PDF`**: Implemented using `jsPDF` to compile a Top Secret UAP dossier with classification banners, metadata grid, auto-page breaks, embedded optical photograph, and NOFORN archive footers.

### 6. Google Workspace Google Docs Synchronization (`services/googleDocsService.ts`)
- **Client-Side Google OAuth**: Secure authentication requesting strictly scoped permissions (`documents`, `drive.file`) without server secrets.
- **1-Click Classified Dossier Export**: Creates formatted Google Docs directly in the investigator's Google Drive, formatted with military classified document headers, coordinate metadata, and forensic analyses.
- **Intel Archive Explorer**: In-app modal listing previously saved dossiers, opening documents directly in Google Docs with one click, or appending real-time tactical notes.
- **Explicit Deletion Confirmation**: Interactive safety dialog before permanently removing dossiers, preventing accidental data loss.

### 7. Multi-Perspective Operational HUD
- **Tactical Radar Grid View**: Full-screen radar sweep with incident marker selection.
- **Dossier Card Grid View**: Visual thumbnail grid with declassified tags and source provenance.
- **Split Dual-Screen Command Center**: Side-by-side simultaneous radar mapping and real-time dossier analysis.

---

## 🛠️ TECHNICAL ARCHITECTURE & STACK

| Layer | Technologies |
| :--- | :--- |
| **Framework & Core** | React 19, TypeScript 5.8, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Cyberpunk CRT Scanline Shaders |
| **Maps & 3D Aerial View** | Google Maps Platform, `@vis.gl/react-google-maps`, Aerial View API |
| **Artificial Intelligence** | `@google/genai` (Gemini 2.5 / 3 Flash & Pro), Imagen 3, Journey TTS |
| **Workspace Integration** | Firebase Auth (Google Sign-In), Google Docs API v1, Google Drive API v3 |
| **Security Architecture** | 100% Client-Side BYOK (`localStorage`), Zero Server Secrets |

---

## 🚀 MULTI-PLATFORM DEPLOYMENT & LOCAL SETUP

### Continuous Integration & Matrix Builds
Automated GitHub Actions workflows are included for cross-platform delivery:
- `.github/workflows/ci.yml`: Type checks (`tsc --noEmit`) and production bundling on every commit.
- `.github/workflows/build-multiplatform.yml`: Release asset builds for Windows (.exe), macOS (.dmg), Linux (.AppImage), and Android/Web PWA (.zip).
- `public/manifest.json`: Full Progressive Web App manifest with standalone display and quick-launch radar shortcuts.

### Local Installation
```bash
# 1. Clone repository
git clone https://github.com/ajarnspencer/uap-intel-nexus.git
cd uap-intel-nexus

# 2. Install dependencies
npm install

# 3. Launch tactical development server (port 3000)
npm run dev

# 4. Production build validation
npm run build
npm run lint
```

### Environment Configuration (Optional)
Create `.env` in the root folder:
```env
# Optional: Set global default Google Maps Platform API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
*(All keys can also be entered interactively in the app's BYOK and Maps Config dialogs).*

---

## 📜 CREDITS & CLEARANCE

- **Lead Analyst & Project Architect**: Ajarn Spencer Littlewood
- **Intelligence Archive**: Global Declassified Defense & Aerial Sensor Repositories
- **Classification**: Public Declassified // Investigator Clearance Level 1
