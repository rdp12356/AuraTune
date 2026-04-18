// Web Audio API engine for binaural beats and background sounds
let audioCtx: AudioContext | null = null;
let leftOsc: OscillatorNode | null = null;
let rightOsc: OscillatorNode | null = null;
let leftGain: GainNode | null = null;
let rightGain: GainNode | null = null;
let merger: ChannelMergerNode | null = null;
let masterGain: GainNode | null = null;
let bgNoiseSource: AudioBufferSourceNode | null = null;
let bgGain: GainNode | null = null;
let isPlaying = false;

const FADE_DURATION = 0.1; // 100ms fade for smoothness

// Cache for generated noise buffers
const noiseBufferCache = new Map<string, AudioBuffer>();

function getOrCreateContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export async function resumeAudioContext() {
  if (!audioCtx) return;
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
  
  // Start with 0 volume and ramp up
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + FADE_DURATION);

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

  merger.connect(masterGain);
  masterGain.connect(ctx.destination);

  leftOsc.start();
  rightOsc.start();
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

  // Fade out
  currentMasterGain.gain.setValueAtTime(currentMasterGain.gain.value, ctx.currentTime);
  currentMasterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_DURATION);

  // Stop after fade
  setTimeout(() => {
    try {
      currentLeftOsc?.stop();
      currentRightOsc?.stop();
    } catch {}
    currentLeftOsc?.disconnect();
    currentRightOsc?.disconnect();
    currentLeftGain?.disconnect();
    currentRightGain?.disconnect();
    currentMerger?.disconnect();
    currentMasterGain?.disconnect();
  }, FADE_DURATION * 1000 + 10);

  leftOsc = null;
  rightOsc = null;
  leftGain = null;
  rightGain = null;
  merger = null;
  masterGain = null;
  isPlaying = false;
}

export function setVolume(volume: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
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
          sample *= 0.3 * (1 + 0.3 * Math.sin(t * 2.5 + channel));
          break;
        case 'ocean':
          sample *= 0.25 * (0.5 + 0.5 * Math.sin(t * 0.4 + channel * 0.5)) * (0.7 + 0.3 * Math.sin(t * 0.15));
          break;
        case 'forest':
          sample *= 0.15 * (1 + 0.4 * Math.sin(t * 3 + channel));
          if (Math.random() < 0.0003) sample += Math.sin(t * 2000) * 0.2;
          break;
        case 'wind':
          sample *= 0.2 * (0.6 + 0.4 * Math.sin(t * 0.7 + channel * 0.3));
          break;
        default:
          sample *= 0.2;
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
      filter.frequency.value = 800;
      filter.Q.value = 0.5;
      break;
    case 'ocean':
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.3;
      break;
    case 'forest':
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.8;
      break;
    case 'wind':
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.5;
      break;
  }

  bgGain = ctx.createGain();
  // Fade in
  bgGain.gain.setValueAtTime(0, ctx.currentTime);
  bgGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + FADE_DURATION);

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
    bgGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
  }
}

export function stopAll() {
  stopBinauralBeat();
  stopBackgroundSound();
}
