// Web Audio API engine for binaural beats and background sounds
let audioCtx: AudioContext | null = null;
let leftOsc: OscillatorNode | null = null;
let rightOsc: OscillatorNode | null = null;
let centerOsc: OscillatorNode | null = null;
let beatLfo: OscillatorNode | null = null;
let leftGain: GainNode | null = null;
let rightGain: GainNode | null = null;
let centerGain: GainNode | null = null;
let beatLfoDepth: GainNode | null = null;
let merger: ChannelMergerNode | null = null;
let masterGain: GainNode | null = null;
let outputCompressor: DynamicsCompressorNode | null = null;
let bgNoiseSource: AudioBufferSourceNode | null = null;
let bgGain: GainNode | null = null;
let isPlaying = false;

// Keepalive: a silent 1-sample looping buffer that prevents Android's battery
// optimizer from suspending the AudioContext ~30s after the screen turns off.
let keepaliveSource: AudioBufferSourceNode | null = null;

const FADE_DURATION = 0.1; // 100ms fade for smoothness
// Human hearing is less sensitive to low frequencies. This boost compensates
// for perceived loudness at the carrier frequencies used (130-528Hz).
// Value derived from ISO 226:2003 equal-loudness contours (~55 phon).
const FREQUENCY_LOUDNESS_BOOST = 1.55;

function getBoostedFrequencyVolume(volume: number) {
  return Math.min(1, volume * FREQUENCY_LOUDNESS_BOOST);
}

// Polyfill for older Android WebViews (Android 7 and below)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioContextClass: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

// Cache for generated noise buffers
const noiseBufferCache = new Map<string, AudioBuffer>();

function startKeepalive(ctx: AudioContext) {
  stopKeepalive();
  try {
    // Some old WebViews reject 1-sample buffers; use 2 samples to be safe
    const silentBuffer = ctx.createBuffer(1, 2, ctx.sampleRate);
    keepaliveSource = ctx.createBufferSource();
    keepaliveSource.buffer = silentBuffer;
    keepaliveSource.loop = true;
    keepaliveSource.connect(ctx.destination);
    keepaliveSource.start(0);
  } catch {
    // Keepalive not supported — audio may stop in background on old devices
    keepaliveSource = null;
  }
}

function stopKeepalive() {
  try {
    keepaliveSource?.stop();
    keepaliveSource?.disconnect();
  } catch {}
  keepaliveSource = null;
}

function getOrCreateContext(): AudioContext {
  const isClosed = audioCtx && audioCtx.state === 'closed';
  if (!audioCtx || isClosed) {
    audioCtx = new AudioContextClass();
    startKeepalive(audioCtx);
  }
  // state can be undefined on very old WebViews — guard with optional chaining
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export async function resumeAudioContext() {
  if (!audioCtx) return;
  if (audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
    startKeepalive(audioCtx);
    return;
  }
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {}
  }
}

export function startBinauralBeat(carrierHz: number, beatHz: number, volume: number = 0.5) {
  stopBinauralBeat();
  const ctx = getOrCreateContext();

  // Create stereo separation for binaural effect
  merger = ctx.createChannelMerger(2);
  masterGain = ctx.createGain();
  outputCompressor = ctx.createDynamicsCompressor();

  // Keep boosted speaker loudness controlled to avoid hard clipping.
  outputCompressor.threshold.value = -14;
  outputCompressor.knee.value = 24;
  outputCompressor.ratio.value = 12;
  outputCompressor.attack.value = 0.003;
  outputCompressor.release.value = 0.25;

  // Start with 0 volume and ramp up
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(getBoostedFrequencyVolume(volume), ctx.currentTime + FADE_DURATION);

  // Left ear: carrier frequency
  leftOsc = ctx.createOscillator();
  leftOsc.type = 'sine';
  leftOsc.frequency.value = carrierHz;
  leftGain = ctx.createGain();
  leftGain.gain.value = 1;
  leftOsc.connect(leftGain);
  leftGain.connect(merger, 0, 0);

  // Right ear: carrier + beat frequency
  rightOsc = ctx.createOscillator();
  rightOsc.type = 'sine';
  rightOsc.frequency.value = carrierHz + beatHz;
  rightGain = ctx.createGain();
  rightGain.gain.value = 1;
  rightOsc.connect(rightGain);
  rightGain.connect(merger, 0, 1);

  // ─── Mono-compatible layer ─────────────────────────────────────────────────
  // On mono speakers / earbuds / some Bluetooth devices, the ChannelMergerNode
  // downmixes by summing both channels. When Left=sin(f) and Right=sin(f+Δ) are
  // summed, the binaural beat effect is LOST and volume is reduced.
  //
  // We add a centre oscillator at the midpoint frequency, amplitude-modulated
  // at the beat rate. This is audible on EVERY device and provides a
  // psychoacoustic entrainment cue even without headphones.
  //
  // Gains boosted (0.65 / 0.45 vs old 0.36 / 0.22) so it is clearly audible.
  centerOsc = ctx.createOscillator();
  centerOsc.type = 'sine';
  centerOsc.frequency.value = carrierHz + (beatHz / 2);

  centerGain = ctx.createGain();
  centerGain.gain.value = 0.65;

  beatLfo = ctx.createOscillator();
  beatLfo.type = 'sine';
  beatLfo.frequency.value = Math.max(0.5, Math.abs(beatHz));

  beatLfoDepth = ctx.createGain();
  beatLfoDepth.gain.value = 0.45;

  beatLfo.connect(beatLfoDepth);
  beatLfoDepth.connect(centerGain.gain);
  centerOsc.connect(centerGain);
  centerGain.connect(masterGain);
  // ──────────────────────────────────────────────────────────────────────────

  merger.connect(masterGain);
  masterGain.connect(outputCompressor);
  outputCompressor.connect(ctx.destination);

  leftOsc.start();
  rightOsc.start();
  centerOsc.start();
  beatLfo.start();
  isPlaying = true;
}

export function stopBinauralBeat() {
  if (!masterGain || !audioCtx) return;

  const ctx = audioCtx;
  const currentMasterGain = masterGain;
  const currentLeftOsc = leftOsc;
  const currentRightOsc = rightOsc;
  const currentMerger = merger;
  const currentLeftGain = leftGain;
  const currentRightGain = rightGain;
  const currentCenterOsc = centerOsc;
  const currentBeatLfo = beatLfo;
  const currentCenterGain = centerGain;
  const currentBeatLfoDepth = beatLfoDepth;
  const currentOutputCompressor = outputCompressor;

  // Fade out
  currentMasterGain.gain.setValueAtTime(currentMasterGain.gain.value, ctx.currentTime);
  currentMasterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_DURATION);

  // Stop after fade
  setTimeout(() => {
    try {
      currentLeftOsc?.stop();
      currentRightOsc?.stop();
      currentCenterOsc?.stop();
      currentBeatLfo?.stop();
    } catch {}
    currentLeftOsc?.disconnect();
    currentRightOsc?.disconnect();
    currentCenterOsc?.disconnect();
    currentBeatLfo?.disconnect();
    currentLeftGain?.disconnect();
    currentRightGain?.disconnect();
    currentCenterGain?.disconnect();
    currentBeatLfoDepth?.disconnect();
    currentMerger?.disconnect();
    currentMasterGain?.disconnect();
    currentOutputCompressor?.disconnect();
  }, FADE_DURATION * 1000 + 10);

  leftOsc = null;
  rightOsc = null;
  leftGain = null;
  rightGain = null;
  centerOsc = null;
  beatLfo = null;
  centerGain = null;
  beatLfoDepth = null;
  merger = null;
  masterGain = null;
  outputCompressor = null;
  isPlaying = false;
}

export function setVolume(volume: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(getBoostedFrequencyVolume(volume), audioCtx.currentTime);
  }
}

export function getIsPlaying() {
  return isPlaying;
}

// Background noise generation using filtered noise
function generateNoiseBuffer(ctx: AudioContext, type: string): AudioBuffer {
  if (noiseBufferCache.has(type)) {
    return noiseBufferCache.get(type)!;
  }

  const sampleRate = ctx.sampleRate;
  const duration = 4; // 4 second loop
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = Math.random() * 2 - 1;

      switch (type) {
        case 'rain':
          sample *= 0.45 * (1 + 0.3 * Math.sin(t * 2.5 + channel));
          break;
        case 'ocean':
          sample *= 0.42 * (0.5 + 0.5 * Math.sin(t * 0.4 + channel * 0.5)) * (0.7 + 0.3 * Math.sin(t * 0.15));
          break;
        case 'forest':
          sample *= 0.25 * (1 + 0.4 * Math.sin(t * 3 + channel));
          if (Math.random() < 0.0003) sample += Math.sin(t * 2000) * 0.2;
          break;
        case 'wind':
          sample *= 0.4 * (0.6 + 0.4 * Math.sin(t * 0.7 + channel * 0.3));
          break;
        default:
          sample *= 0.3;
      }
      data[i] = sample;
    }
  }

  noiseBufferCache.set(type, buffer);
  return buffer;
}

export function startBackgroundSound(type: string, volume: number = 0.3) {
  stopBackgroundSound();
  if (type === 'none') return;

  const ctx = getOrCreateContext();
  const buffer = generateNoiseBuffer(ctx, type);

  bgNoiseSource = ctx.createBufferSource();
  bgNoiseSource.buffer = buffer;
  bgNoiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  switch (type) {
    case 'rain':
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
      break;
    case 'ocean':
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.3;
      break;
    case 'forest':
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.8;
      break;
    case 'wind':
      filter.type = 'bandpass';
      filter.frequency.value = 700;
      filter.Q.value = 0.45;
      break;
  }

  bgGain = ctx.createGain();
  const targetVolume = Math.min(1, volume * 1.6);
  // Fade in
  bgGain.gain.setValueAtTime(0, ctx.currentTime);
  bgGain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + FADE_DURATION);

  bgNoiseSource.connect(filter);
  filter.connect(bgGain);
  bgGain.connect(ctx.destination);
  bgNoiseSource.start();
}

export function stopBackgroundSound() {
  if (!bgNoiseSource || !bgGain || !audioCtx) return;

  const ctx = audioCtx;
  const currentBgGain = bgGain;
  const currentBgSource = bgNoiseSource;

  // Fade out
  currentBgGain.gain.setValueAtTime(currentBgGain.gain.value, ctx.currentTime);
  currentBgGain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_DURATION);

  // Stop after fade
  setTimeout(() => {
    try {
      currentBgSource?.stop();
    } catch {}
    currentBgSource?.disconnect();
    currentBgGain?.disconnect();
  }, FADE_DURATION * 1000 + 10);

  bgNoiseSource = null;
  bgGain = null;
}

export function setBgVolume(volume: number) {
  if (bgGain && audioCtx) {
    bgGain.gain.cancelScheduledValues(audioCtx.currentTime);
    bgGain.gain.setValueAtTime(Math.min(1, volume * 1.6), audioCtx.currentTime);
  }
}

export function stopAll() {
  stopBinauralBeat();
  stopBackgroundSound();
}
