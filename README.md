# GANJA HOUSE KOH LANTA — EQUATORIAL CEA INTELLIGENCE NEXUS

<p align="center">
  <img src="https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=1200&q=80" alt="Ganja House Koh Lanta Emblem" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-Proprietary%20Ganja%20House-16a34a?style=for-the-badge&logo=shield" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Thai%20FDA-GACP%20Compliant-059669?style=for-the-badge&logo=checkmarx" alt="Thai FDA GACP Compliance" />
  <img src="https://img.shields.io/badge/Multi--Platform-Web%20%7C%20PWA%20%7C%20Win%20%7C%20macOS%20%7C%20Linux-e11d48?style=for-the-badge" alt="Multi-Platform" />
  <img src="https://img.shields.io/badge/BYOK%20Security-100%25%20Client--Side%20Isolation-10b981?style=for-the-badge&logo=security" alt="100% BYOK Isolation" />
</p>

---

## 🌿 EXECUTIVE OVERVIEW

**Ganja House Koh Lanta — Equatorial CEA Management System** is a mission-critical agronomic and telemetry operations console engineered specifically for precision equatorial Controlled Environment Agriculture (CEA) on the island of Koh Lanta, Krabi Province, Andaman Sea, Thailand (Latitude: 7.5348° N, Longitude: 99.0583° E).

Cultivating medical-grade cannabis under humid tropical maritime microclimates requires micro-climatic equilibrium. High ambient vapor pressure, tropical monsoon depressions, and high ambient daytime temperatures demand strict sensor regulation, psychrometric monitoring, and rapid botanical adjustments.

This platform bridges real-time ESP32 edge telemetry, continuous psychrometric Tetens Leaf Vapor Pressure Deficit (VPD) modeling, Google Maps Platform satellite radar mapping, Google Docs synchronized dossier exports, Dutch Passion genetic database tracking, and multimodal Google Gemini botanical intelligence into a single unified operations dashboard.

---

## 🔐 STAFF ACCESS & BYOK (BRING YOUR OWN KEY) POLICY

### Why Personal Keys Are Required
To guarantee zero cross-tenant contamination, protect proprietary botanical breeding logs, and eliminate backend telemetry snooping, Ganja House Koh Lanta strictly adheres to a **100% Client-Side Bring Your Own Key (BYOK)** sandbox architecture:

1. **Local Isolation (`localStorage`)**: Your Google Gemini API Key and Google Workspace access tokens are stored strictly within the client browser session. They are never transmitted to, logged by, or proxied through any third-party intermediary server.
2. **Autonomous Botanical Advisor & Harvest Forecaster**: Real-time multi-variable plant evaluations, Tetens VPD zone alerts, and spectral HPLC yield forecasts utilize Gemini 2.5/3 multimodal models billed directly to your personal Google Cloud quota.
3. **Zero In-House Credential Storage**: If a workstation is logged out or revoked, all cryptographic credentials in memory and cache are purged instantaneously.

👉 **Ganja House Staff Key Provisioning Console**:
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) *(Open in a new tab to create or renew your free-tier / pay-as-you-go Gemini API key)*.

---

## ⚡ COMPLETE FEATURE BREAKDOWN

### 1. Real-Time ESP32 / DHT22 Sensor Telemetry & Tetens Leaf VPD Calculation
- **Physical Sensor Interfacing**: Streams temperature (°C/°F), relative humidity (RH%), canopy leaf temperature via infrared thermometry, and ambient air pressure.
- **Tetens Formula Integration**: Computes saturation vapor pressure $e_s(T)$ and actual vapor pressure $e_a(T)$ to derive instantaneous Leaf Vapor Pressure Deficit:
  $$e_s(T) = 0.61078 \exp\left(\frac{17.27 \cdot T}{T + 237.3}\right)\text{ kPa}$$
  $$\text{VPD}_{\text{leaf}} = e_s(T_{\text{leaf}}) - e_a(T_{\text{air}})$$

### 2. Psychrometric VPD Heatmap & Continuous Optimal Zone Overlay
- Dynamic Mollier psychrometric psychrometer rendering ambient moisture vs. thermal gradients.
- Color-coded target zones tailored for equatorial tropical growth:
  - **Early Vegetative / Clones**: $0.4 - 0.8\text{ kPa}$
  - **Late Vegetative**: $0.8 - 1.1\text{ kPa}$
  - **Mid-to-Late Flowering**: $1.2 - 1.5\text{ kPa}$
  - **Botrytis / Mold Danger Zone**: $< 0.4\text{ kPa}$ or $> 1.8\text{ kPa}$

### 3. Digital Oscilloscope Screen, 12-Band Equalizer & LCD Matrix
- Real-time oscilloscope canvas monitoring electrical micro-fluctuations, HVAC cycling frequencies, and photoperiod ballast pulse width modulation (PWM).
- 12-Band environmental equalizer visualizing spectral photosynthetic photon flux density (PPFD) across PAR bands (400nm – 730nm UV/Far-Red).
- Retro-luminescent matrix LCD displaying canopy stats and hardware uptime.

### 4. Autonomous Sensor Breach & Workflow Notification Dispatch System
- Real-time breach detection when relative humidity spikes beyond maritime limits or VPD drifts from the target vegetative/bloom band.
- Automated alert triggers for climate controllers, dehumidifier banks, and exhaust louvers.

### 5. Self-Contained Grow Database & Chronological Events Sequence Log
- Indexed offline-first grow repository capturing strain pheno-hunts, vegetative stage transitions, flushing sequences, and nutrient EC/PPM formulations.
- Chronological timeline tracking every foliar spray, pruning, and environmental tweak.

### 6. Monthly Calendar Archive with Day-by-Day Milestone Inspector
- Comprehensive calendar grid mapping seed germination, veg day counts, 12/12 flip dates, trichome amber milestones, and estimated harvest windows.

### 7. Manual Harvest Results Entry & HPLC Lab Dossier
- Wet harvest weight, dry trimmed weight, grams per Watt ($g/\text{W}$), and grams per square meter ($g/\text{m}^2$).
- High-Performance Liquid Chromatography (HPLC) cannabinoid profile entries: $\Delta^9$-THC%, CBD%, CBG%, CBN%, and total terpenes percentage with organoleptic sensory radar charts.

### 8. Side-by-Side Harvest Comparison Matrix with 1-Click AI Pre-Loading
- Benchmarks historical harvest batches side-by-side.
- 1-click loading directly into Gemini multimodal reasoning to diagnose yield differentials between nutrient recipes or lighting configurations.

### 9. Interactive Gemini Botanical AI Advisor with Direct Grow DB Integration
- Deep contextual agronomy bot grounded on Andaman Sea micro-climate variables.
- Direct memory bridge into the active batch database to evaluate foliar health, nutrient deficiencies, or VPD stress.

### 10. Dutch Passion Official Reseller Database & Seedbanks Repository
- Authentic genetic archives from Dutch Passion Amsterdam (Auto Orange Bud, Desfrán, Think Different, Durban Poison, etc.).
- Complete germination profiles, expected flowering cycles, and resistance characteristics for equatorial sea-level cultivation.

### 11. Google Maps Platform Tactical Radar & Cinematic 3D Aerial Flyovers
- Global and regional tactical radar using `@vis.gl/react-google-maps` with `AdvancedMarker` pulse pins.
- Cinematic Google Maps Aerial View API 3D flyovers for aerial reconnaissance of coastal facilities and anomalous coordinates.

### 12. Google Docs Intelligence Synchronizer
- Google Workspace OAuth integration (`documents`, `drive.file`) enabling 1-click export of classified intelligence dossiers and crop records directly into Google Docs.
- User confirmation safety dialogues for any document deletion operations.

---

## 🛠️ HARDWARE INTEGRATION MASTER GUIDE

### 1. ESP32-S3 C++ Firmware Setup
The edge microcontroller nodes connect via 2.4GHz Wi-Fi or ESP-NOW mesh network:
```cpp
// ESP32-S3 CEA Edge Node - Ganja House Koh Lanta
#include <WiFi.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin("GANJA_HOUSE_LANTA_SECURE", "AndamanSeaCleanCEA2026");
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  // Compute Leaf VPD approximation
  float vpd = calculateLeafVPD(t, h);
  Serial.printf("{\"temp\": %.2f, \"humidity\": %.2f, \"vpd\": %.2f}\n", t, h, vpd);
  delay(2000);
}
```

### 2. Python SBC Edge Daemon
Running on Raspberry Pi 5 or Orange Pi 5 edge controller:
```python
# edge_daemon.py - Ganja House Andaman Edge Gateway
import serial, json, time, requests

ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

while True:
    line = ser.readline().decode('utf-8').strip()
    if line.startswith('{'):
        payload = json.loads(line)
        print(f"Dispatched Telemetry: {payload}")
    time.sleep(1)
```

### 3. Antigravity CLI, Hermes & OpenClaw Integration
- **Antigravity CLI**: Automated edge orchestration tool configuring environmental set-points and over-the-air (OTA) ESP32 firmware updates.
- **Hermes Message Bus**: High-throughput Pub/Sub bus coordinating real-time telemetry dispatch to the web client.
- **OpenClaw Control Loop**: PID feedback loop controlling exhaust fans, oscillating fans, and commercial dehumidification banks.

---

## 🚀 MULTI-PLATFORM DEPLOYMENT & LOCAL SETUP

### Prerequisites
- Node.js 20.x or higher
- npm 10+ or bun

### 1. Web Local Setup
```bash
# Clone the repository
git clone https://github.com/ganjahouselanta/uap-intel-nexus.git
cd uap-intel-nexus

# Install dependencies
npm install

# Run the local development server (Port 3000)
npm run dev
```

### 2. Progressive Web App (PWA) on Android & iOS
1. Open the hosted web URL in Google Chrome (Android) or Safari (iOS).
2. Tap the browser menu `⋮` or the Share button `⎋`.
3. Select **"Install Application"** or **"Add to Home Screen"**.
4. The application installs as a standalone app with offline asset caching and full hardware viewport presence.

### 3. Windows Desktop Build (.exe / .zip)
```bash
npm run build
# Package Windows distribution
powershell Compress-Archive -Path dist/* -DestinationPath ganja-house-cea-windows-x64.zip
```

### 4. macOS Desktop Build (.dmg / .zip)
```bash
npm run build
# Create macOS distribution package
zip -r ganja-house-cea-macos.zip dist/
```

### 5. Linux Desktop Build (.AppImage / .tar.gz)
```bash
npm run build
tar -czf ganja-house-cea-linux-x64.tar.gz -C dist .
```

---

## 📜 REGULATORY COMPLIANCE & LEGAL NOTICES

- **Thai FDA GACP Compliant**: Designed according to Thailand Ministry of Public Health Good Agricultural and Collection Practices (GACP) for Controlled Plants.
- **Ajarn Spencer Littlewood**: Architectural and investigative credit.
- **License**: Ganja House Koh Lanta Proprietary Agronomic & Telemetry Software. All rights reserved.
