/**
 * UAP Intel Nexus — Client-Side YouTube MP4 Video Synthesis Engine
 * 
 * Synthesizes a 16:9 broadcast-quality video combining:
 * 1. High-fidelity Nano Banana Pro photographic still image reconstruction.
 * 2. Complete neural spoken audio briefing track.
 * 3. Animated tactical HUD overlay with synchronized real-time audio waveform,
 *    incident coordinates, classification headers, and timestamps.
 * 
 * Produces an MP4 (or WebM YouTube-compatible) file ready for 1-click upload to YouTube.
 */

export interface VideoExportProgress {
  progress: number; // 0 - 100
  status: string;
  timeRemainingSec?: number;
}

export interface VideoExportOptions {
  imageUrl: string;
  audioUrl: string;
  article: {
    title: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    source?: string;
  };
  voiceId: string;
  maxDurationSec?: number; // Optional limit (e.g., teaser)
  onProgress?: (progress: VideoExportProgress) => void;
  abortSignal?: AbortSignal;
}

/**
 * Checks supported video mimeTypes for export.
 */
export function getSupportedVideoMimeType(): { mimeType: string; extension: string } {
  const preferred = [
    { mimeType: 'video/mp4;codecs=avc1,mp4a.40.2', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' }
  ];

  for (const item of preferred) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(item.mimeType)) {
      return item;
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

/**
 * Renders and exports a YouTube-ready 16:9 video from image + audio.
 */
export async function generateYouTubeVideo(options: VideoExportOptions): Promise<{ blob: Blob; filename: string }> {
  const { imageUrl, audioUrl, article, voiceId, maxDurationSec, onProgress, abortSignal } = options;

  onProgress?.({ progress: 5, status: 'Initializing video rendering engine...' });

  // 1. Preload image
  const img = new Image();
  if (!imageUrl.startsWith('data:')) {
    img.crossOrigin = 'anonymous';
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load visual reconnaissance image for video.'));
    img.src = imageUrl;
  });

  if (abortSignal?.aborted) {
    throw new Error('Video generation was cancelled.');
  }

  onProgress?.({ progress: 15, status: 'Decoding neural audio track...' });

  // 2. Fetch and decode audio
  const audioResp = await fetch(audioUrl);
  if (!audioResp.ok) {
    throw new Error(`Failed to load audio stream: ${audioResp.statusText}`);
  }
  const audioArrayBuffer = await audioResp.arrayBuffer();

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

  const rawAudioData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const totalAudioDuration = audioBuffer.duration;
  const targetDuration = maxDurationSec ? Math.min(totalAudioDuration, maxDurationSec) : totalAudioDuration;

  if (abortSignal?.aborted) {
    audioCtx.close();
    throw new Error('Video generation was cancelled.');
  }

  onProgress?.({ progress: 25, status: 'Setting up 16:9 1280x720 broadcast canvas...' });

  // 3. Setup Canvas (1280x720 standard 720p HD 16:9 for YouTube)
  const width = 1280;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    audioCtx.close();
    throw new Error('Failed to obtain 2D canvas context for video encoding.');
  }

  // 4. Setup MediaStreams for Canvas (video) and Web Audio (audio)
  const fps = 30;
  const canvasStream = canvas.captureStream(fps);
  const mediaStreamDest = audioCtx.createMediaStreamDestination();

  // Create audio source node
  const sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(mediaStreamDest);

  // Combine video and audio tracks
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...mediaStreamDest.stream.getAudioTracks()
  ]);

  const { mimeType, extension } = getSupportedVideoMimeType();

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 3_500_000 // 3.5 Mbps for crisp HD visuals on YouTube
    });
  } catch (err) {
    recorder = new MediaRecorder(combinedStream);
  }

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  return new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
    let animationFrameId: number;
    let startTime: number | null = null;
    let isFinished = false;

    const cleanup = () => {
      isFinished = true;
      cancelAnimationFrame(animationFrameId);
      try {
        sourceNode.stop();
      } catch (e) {
        // already stopped
      }
      sourceNode.disconnect();
      audioCtx.close().catch(() => {});
    };

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('Video generation cancelled by user.'));
      });
    }

    recorder.onstop = () => {
      cleanup();
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      const safeTitle = article.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
      const filename = `UAP_Nexus_${safeTitle}_YouTube.${extension}`;
      resolve({ blob: finalBlob, filename });
    };

    recorder.onerror = (e) => {
      cleanup();
      reject(new Error('MediaRecorder encountered an encoding error: ' + (e as any).error));
    };

    // Helper format time
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Frame rendering function
    const renderFrame = (now: number) => {
      if (isFinished) return;

      if (startTime === null) {
        startTime = now;
      }

      const elapsed = (now - startTime) / 1000;

      if (elapsed >= targetDuration) {
        // Finished recording
        onProgress?.({ progress: 100, status: 'Finalizing MP4 container and finalizing video...' });
        recorder.stop();
        return;
      }

      // 1. Draw Background Image (Scale to fill 16:9 canvas cleanly)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = width / height;
      let drawW = width;
      let drawH = height;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > targetAspect) {
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        drawY = (height - drawH) / 2;
      }

      // Subtle slow cinematic zoom (Ken Burns effect)
      const zoomFactor = 1 + (elapsed / targetDuration) * 0.05;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomFactor, zoomFactor);
      ctx.drawImage(img, drawX - width / 2, drawY - height / 2, drawW, drawH);
      ctx.restore();

      // 2. Dark Vignette and Gradient Overlays for Readability
      const topGrad = ctx.createLinearGradient(0, 0, 0, 160);
      topGrad.addColorStop(0, 'rgba(3, 7, 18, 0.92)');
      topGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 160);

      const bottomGrad = ctx.createLinearGradient(0, height - 190, 0, height);
      bottomGrad.addColorStop(0, 'rgba(3, 7, 18, 0)');
      bottomGrad.addColorStop(1, 'rgba(3, 7, 18, 0.94)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height - 190, width, 190);

      // Subtle tactical scanline effect
      ctx.fillStyle = 'rgba(0, 255, 120, 0.015)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }

      // 3. Top Banner: Declassified Incident Dossier
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 15px ui-monospace, monospace';
      
      // Blinking live broadcast beacon
      const blink = Math.floor(elapsed * 2) % 2 === 0;
      ctx.fillStyle = blink ? '#ef4444' : '#991b1b';
      ctx.beginPath();
      ctx.arc(36, 36, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.fillText('TOP SECRET // UAP INTEL NEXUS DOSSIER', 52, 40);

      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.font = '13px ui-monospace, monospace';
      ctx.fillText(`CLEARANCE: LEVEL-4 // SIG_SOURCE: ${article.source || 'DoD / AARO'}`, width - 420, 40);

      // Article Title
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 28px ui-monospace, monospace';
      const truncatedTitle = article.title.length > 55 ? article.title.substring(0, 52) + '...' : article.title;
      ctx.fillText(truncatedTitle, 36, 80);

      // Subtitle: Location & Coordinates
      if (article.location) {
        ctx.fillStyle = '#34d399';
        ctx.font = '15px ui-monospace, monospace';
        const coordsText = article.coordinates 
          ? `[GRID: ${article.coordinates.lat.toFixed(4)}°, ${article.coordinates.lng.toFixed(4)}°]` 
          : '';
        ctx.fillText(`📍 ${article.location} ${coordsText}`, 36, 110);
      }

      // 4. Center Watermark Reticle / Telemetry Borders
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 1;
      // Corner brackets
      const bSize = 30;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(36, 140 + bSize); ctx.lineTo(36, 140); ctx.lineTo(36 + bSize, 140);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - 36 - bSize, 140); ctx.lineTo(width - 36, 140); ctx.lineTo(width - 36, 140 + bSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(36, height - 170 - bSize); ctx.lineTo(36, height - 170); ctx.lineTo(36 + bSize, height - 170);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - 36 - bSize, height - 170); ctx.lineTo(width - 36, height - 170); ctx.lineTo(width - 36, height - 170 - bSize);
      ctx.stroke();

      // 5. Audio Waveform Spectrum Visualization reacting to the audio track
      const currentSampleIdx = Math.floor(elapsed * sampleRate);
      const windowSize = 1024;
      const barCount = 48;
      const barWidth = 10;
      const barGap = 6;
      const startX = 36;
      const waveBaseY = height - 75;

      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
      for (let i = 0; i < barCount; i++) {
        const sampleOffset = currentSampleIdx + Math.floor((i / barCount) * windowSize);
        let sampleVal = 0;
        if (sampleOffset >= 0 && sampleOffset < rawAudioData.length) {
          sampleVal = Math.abs(rawAudioData[sampleOffset]);
        }
        // Smooth scaling for visual punch
        const barHeight = Math.max(4, Math.min(65, sampleVal * 120 + Math.sin(elapsed * 8 + i * 0.3) * 3));
        const bx = startX + i * (barWidth + barGap);
        const by = waveBaseY - barHeight;

        // Gradient for bars
        const barGrad = ctx.createLinearGradient(bx, by, bx, waveBaseY);
        barGrad.addColorStop(0, '#4ade80');
        barGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = barGrad;
        ctx.fillRect(bx, by, barWidth, barHeight);
      }

      // 6. Time and Progress Bar
      const progressPercent = Math.min(1, elapsed / targetDuration);
      const pBarX = 36;
      const pBarY = height - 45;
      const pBarW = width - 72;
      const pBarH = 6;

      // Track background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(pBarX, pBarY, pBarW, pBarH);

      // Filled progress
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(pBarX, pBarY, pBarW * progressPercent, pBarH);

      // Current time vs Total time
      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(`${formatTime(elapsed)} / ${formatTime(targetDuration)}`, width - 180, waveBaseY - 15);

      // 7. Footer Attribution & Persona Info
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(`NEURAL VOICE BRIEFING: ${voiceId.toUpperCase()}  ·  NANO BANANA PRO SURVEILLANCE  ·  SUPERVISED BY AJARN SPENCER LITTLEWOOD`, 36, height - 20);

      ctx.fillStyle = '#22c55e';
      ctx.fillText('UAP INTEL NEXUS', width - 170, height - 20);

      // Update progress callback
      const percent = Math.min(99, Math.round(25 + progressPercent * 70));
      const remaining = Math.max(0, Math.round(targetDuration - elapsed));
      onProgress?.({
        progress: percent,
        status: `Encoding broadcast frames (${formatTime(elapsed)} / ${formatTime(targetDuration)})...`,
        timeRemainingSec: remaining
      });

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    // Start audio buffer source node & MediaRecorder simultaneously
    recorder.start(100);
    sourceNode.start(0);
    animationFrameId = requestAnimationFrame(renderFrame);
  });
}
