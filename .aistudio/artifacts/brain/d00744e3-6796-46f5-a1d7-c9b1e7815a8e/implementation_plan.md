# Streamlined Intel Dossiers Workstation & YouTube MP4 Video Synthesis

Streamline UAP Intel Nexus by removing the 3D Earth globe, tactical radar, and flyover mockups to return to a high-speed, single-view intelligence dossiers console. This change embeds Google Maps Platform directly inside the dossier modal for precise sighting geolocation, preserves Google Docs export, and adds 1-click client-side MP4 video export combining the generated Nano Banana Pro visual thumbnail and neural audio briefing for direct YouTube uploads.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core product simplifications and additions have been defined based on your requirements:

- **Confirmed Decision 1: Single-View Intel Dossiers Feed**: The tactical 3D rotating globe, 2D tactical radar canvas, flyover animations, and view switcher tabs (Tactical Radar / Split Command) will be completely removed. The main console returns to an authoritative, ultra-responsive single-feed Intel Dossiers grid with full pagination, search/filtering, and BYOK credentials management.
- **Confirmed Decision 2: Google Maps Inside Dossier Modal**: Google Maps is integrated directly inside the dossier modal. Each incident displays an interactive satellite/hybrid map centered on the reported coordinates with an advanced location marker, formatted address, and sector triangulation details.
- **Confirmed Decision 3: YouTube MP4 Video Generation**: In addition to raw audio (`.wav`) downloads and original source document links, an in-browser MP4 video renderer will synthesize the high-fidelity Nano Banana Pro photographic representation with the spoken neural audio briefing into a ready-to-upload 16:9 MP4 video file.
- **Confirmed Decision 4: Preserved Cloud & Document Exports**: 1-click Google Docs export via OAuth 2.0, PDF dossier export via jsPDF, and Markdown exports are fully preserved.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the platform into a streamlined, military-grade UAP Intelligence Dossier Workstation. Analysts can inspect declassified and real-time aerial phenomena incidents, view photorealistic Nano Banana Pro photographic reconstructions, explore the physical encounter coordinates via Google Maps, listen to neural audio briefings across 8 Journey voice personas, export dossiers directly to Google Docs or PDF, and generate 16:9 YouTube-ready MP4 videos in one click.
- **Target Audience / Persona**: Aerospace observers, defense analysts, investigative journalists, and researchers needing accurate geolocation, verified source links, multi-angle analytical reports, and multimedia assets formatted for public presentation.
- **Key Value**: Replaces complex, non-functional canvas mockups with real geolocation data, pristine typography, verified source attribution, and seamless social/video distribution capabilities.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Browse Dossier Stream**: The analyst arrives at the clean Intel Dossiers console, browsing verified encounter dispatches with unboxed metadata (coordinates, timestamp, source agency, classification tier).
2. **Open Intel Dossier**: Clicking any report opens the full-screen intelligence inspection modal.
3. **Interactive Sighting Geolocation (Google Maps)**: Directly beneath the dossier header and photographic reconstruction, an interactive Google Map displays the exact incident coordinate lock, nearby landmark address, and latitude/longitude graticule.
4. **Multimedia Audio & YouTube MP4 Export**: The analyst listens to the neural voice briefing, switches analytical styles (Academic, Gonzo, Skeptic, Viral), and clicks **"Export YouTube Video (MP4)"** to download a rendered 1080p/720p 16:9 video with still imagery and audio for immediate YouTube upload.
5. **Document Archiving**: Analysts can save the dossier directly to their personal Google Drive/Docs or export classified PDF and Markdown files.

#### Visual Identity & Theme
- **Aesthetic Direction**: Tactical declassified defense workstation — sleek, dark cyber aesthetic with high contrast, legible monospaced typography, subtle scanlines, and emerald/cyan telemetry accents.
- **Color Palette**:
  - Background: Deep Void (`#030712`, `#0b0f19`) with subtle radial gradients.
  - Accent / Primary: Tactical Green (`#22c55e`, `#10b981`) and Telemetry Cyan (`#06b6d4`, `#38bdf8`).
  - Borders & Dividers: Muted emerald borders (`border-emerald-900/40`) with crisp geometric radius math.
- **Typography**: Clean monospace font stack (`JetBrains Mono`, `ui-monospace`, `monospace`) with strict zero-pill discipline — metadata rendered as unboxed text separated by typographic middots (`·`) rather than rounded badge pills.
- **Motion & Feedback**: Instant modal transitions, progress bar during video rendering, live playback timer for audio briefings, and animated status pulses for active sensor connections.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Complete Removal of 3D Globe & Radar vs. Simplified Canvas**
  - *Chosen Approach*: Remove `UAPTacticalMap.tsx` and all associated 3D sphere / radar math.
  - *Why*: The globe and simulated radar lacked worldwide live flight radar telemetry, created visual clutter, and detracted from verified incident data.
  - *Alternatives Considered*: Retaining a static mini-radar widget was rejected in favor of a clean, focused dossier view.
- **Decision 2: Client-Side MP4 Video Rendering via Canvas & MediaRecorder**
  - *Chosen Approach*: Synthesize an HTML5 canvas holding the 16:9 Nano Banana Pro still image (with subtle HUD watermark and audio duration) combined with the Web Audio API audio stream into a standard `.mp4`/`.webm` container via `MediaRecorder`.
  - *Why*: Runs 100% in-browser without server rendering costs, external API quotas, or video upload delays, producing an instant file ready for YouTube.
  - *Alternatives Considered*: Server-side FFmpeg transcoding was rejected because it requires backend infrastructure and violates the 100% client-side BYOK security sandbox.
- **Decision 3: Google Maps Integration inside the Dossier Modal**
  - *Chosen Approach*: Mount Google Maps JavaScript API with custom dark styling inside a dedicated "Geolocation & Sector Map" panel in `AnalysisModal.tsx`.
  - *Why*: Gives researchers immediate geographic context (terrain, shoreline, airports, military installations) for the specific incident without leaving the report.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UAP Intel Nexus Console                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Navigation Header: Brand, BYOK Status, Google Docs Archive, Revoke│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Filter & Scan Bar: Voice ID Selector, Items Per Page, Scan Grid  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Intel Dossiers Grid Feed                     │  │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      │  │
│  │  │ Dossier Card │     │ Dossier Card │     │ Dossier Card │      │  │
│  │  └──────────────┘     └──────────────┘     └──────────────┘      │  │
│  │  [Pagination Controls: Page X of Y, Prev / Next]                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Opens Incident
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Analysis & Dossier Modal                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Header: Incident Title, Source Document URL, Classification   │  │
│  │ 2. Visual Surveillance: Nano Banana Pro 16:9 Cinematic Photo     │  │
│  │ 3. Geolocation Radar: Embedded Google Maps (Sector Pin + Address)│  │
│  │ 4. Neural Audio: Audio Player + [.WAV Download] + [Export MP4]   │  │
│  │ 5. Analytical Narrative: Academic / Gonzo / Skeptic / Viral      │  │
│  │ 6. Export Deck: [Google Docs] [Download PDF] [Copy Markdown]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌────────────────────────────────┐              ┌────────────────────────────────┐
│   Google Maps Platform API     │              │    Client-Side MP4 Exporter    │
│  - Dynamic Map (Dark Tactical) │              │  - 16:9 Nano Banana Still      │
│  - Advanced Marker & Infowindow│              │  - MediaRecorder + Audio Stream│
│  - Geocoding & Lat/Lng Bounds  │              │  - YouTube-Ready MP4 Download  │
└────────────────────────────────┘              └────────────────────────────────┘
```

#### Core Components & File Updates
1. `App.tsx`:
   - Remove `viewMode` state, radar/split toggle buttons, and `UAPTacticalMap` import.
   - Set default view to direct Intel Dossiers grid with full-width layout and clean pagination.
   - Clean header and metadata display.
2. `components/AnalysisModal.tsx`:
   - Integrate Google Maps container for incident coordinates (`article.coordinates`, `article.location`, `article.proximateAddress`).
   - Add direct link button to original source documents (`article.url`).
   - Add **"Export YouTube Video (MP4)"** tool: combines Nano Banana Pro visual image + spoken audio into a downloadable `.mp4` file.
   - Retain audio `.wav` download, Google Docs export, and PDF generation.
3. `services/mapsService.ts`:
   - Helper to load Google Maps script dynamically and render interactive satellite/terrain maps with custom tactical styling.
4. `services/videoExportService.ts`:
   - In-browser generator combining the still image canvas and audio buffer into a playable, downloadable MP4 video for YouTube.
5. `README.md` & `metadata.json`:
   - Synchronize documentation and metadata to reflect the streamlined dossiers interface and new YouTube MP4 capability.
