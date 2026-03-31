/**
 * SoundEngine — Web Audio API procedural sound synthesis
 * All sounds < 100KB total. ±2 semitone randomization.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;
let volume = 0.7;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

function randomPitch(base: number): number {
  const semitones = (Math.random() - 0.5) * 4; // ±2 semitones
  return base * Math.pow(2, semitones / 12);
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  envelope?: { attack?: number; decay?: number; sustain?: number; release?: number }
) {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const env = { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1, ...envelope };

  osc.type = type;
  osc.frequency.value = randomPitch(freq);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + env.attack);
  gain.gain.linearRampToValueAtTime(env.sustain, ctx.currentTime + env.attack + env.decay);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = "sine", delay = 0) {
  freqs.forEach((f, i) => {
    setTimeout(() => playTone(f, duration, type), delay * i);
  });
}

// --- Public API ---

/** Bright 8-bit completion ding */
export function playComplete() {
  playTone(880, 0.2, "square", { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.1 });
}

/** Coin-like ka-ching for XP */
export function playXPAward() {
  if (isMuted) return;
  playTone(1200, 0.08, "square");
  setTimeout(() => playTone(1600, 0.1, "square"), 50);
}

/** Metallic coin clink for Gold */
export function playGoldDrop() {
  playTone(2400, 0.1, "triangle", { attack: 0.002, decay: 0.03, sustain: 0.1, release: 0.05 });
}

/** Triumphant ascending fanfare */
export function playLevelUp() {
  if (isMuted) return;
  playChord([523, 659, 784], 0.15, "square", 120);
  setTimeout(() => playTone(1047, 0.3, "square"), 480);
}

/** Warm ascending two-note chime */
export function playStreakFire() {
  if (isMuted) return;
  playTone(660, 0.15, "sine");
  setTimeout(() => playTone(880, 0.2, "sine"), 100);
}

/** Extended celebration jingle */
export function playStreakMilestone() {
  if (isMuted) return;
  const notes = [523, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.12, "square"), i * 100);
  });
}

/** Mysterious sparkle + thud */
export function playDropChest() {
  if (isMuted) return;
  playTone(200, 0.2, "sine", { attack: 0.01, sustain: 0.5 });
  setTimeout(() => playTone(1800, 0.15, "triangle"), 100);
}

/** Burst + reveal shimmer */
export function playDropOpen() {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

/** Achievement unlocked — 3 ascending notes */
export function playBadgeEarn() {
  if (isMuted) return;
  playChord([659, 784, 988], 0.15, "triangle", 100);
}

/** Impact thud + creature cry */
export function playBossHit() {
  if (isMuted) return;
  playTone(100, 0.15, "sawtooth", { attack: 0.005, sustain: 0.3 });
  setTimeout(() => playTone(300, 0.1, "square"), 80);
}

/** Victory fanfare + cheer */
export function playBossDefeat() {
  if (isMuted) return;
  const fanfare = [523, 659, 784, 1047, 1319];
  fanfare.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.18, "square"), i * 150);
  });
}

/** Soft descending two-note error */
export function playError() {
  if (isMuted) return;
  playTone(440, 0.12, "sine");
  setTimeout(() => playTone(330, 0.15, "sine"), 80);
}

/** Quick staccato note, pitch rises per step */
let flowStepIndex = 0;
export function playFlowStep() {
  const base = 600 + flowStepIndex * 50;
  playTone(base, 0.1, "triangle");
  flowStepIndex++;
}

/** Flourishing completion melody */
export function playFlowDone() {
  flowStepIndex = 0;
  if (isMuted) return;
  playChord([523, 784, 1047], 0.2, "triangle", 80);
  setTimeout(() => playTone(1319, 0.3, "sine"), 320);
}

// --- Controls ---

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (masterGain) masterGain.gain.value = volume;
}

export function getVolume(): number {
  return volume;
}

export function setMuted(m: boolean) {
  isMuted = m;
}

export function getMuted(): boolean {
  return isMuted;
}

export function resetFlowStep() {
  flowStepIndex = 0;
}
