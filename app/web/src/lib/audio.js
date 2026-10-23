// typewriter audio with zero assets: filtered noise for keys, a sine for bell
let audio = null;

function ensureAudio() {
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio.state === 'running' ? audio : null;
  } catch {
    return null;
  }
}

export function keyClack() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
  const channel = noise.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2600;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  src.connect(band).connect(gain).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.04);
}

export function returnBell() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const bell = ctx.createOscillator();
  bell.frequency.value = 1440;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.28);
  bell.connect(gain).connect(ctx.destination);
  bell.start();
  bell.stop(ctx.currentTime + 0.3);
}
