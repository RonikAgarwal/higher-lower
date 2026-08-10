import { useCallback, useRef, useState, useMemo } from 'react';

type SoundType = 'click' | 'countdown' | 'go' | 'correct' | 'wrong' | 'scoreUp' | 'milestone' | 'gameOver';

const audioContextRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  return audioContextRef.current;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

const soundEffects: Record<SoundType, () => void> = {
  click: () => {
    playTone(800, 0.08, 'square', 0.06);
  },
  countdown: () => {
    playTone(440, 0.15, 'sine', 0.12);
  },
  go: () => {
    playTone(660, 0.1, 'square', 0.12);
    setTimeout(() => playTone(880, 0.2, 'square', 0.12), 80);
  },
  correct: () => {
    playTone(523, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160);
  },
  wrong: () => {
    playTone(300, 0.15, 'sawtooth', 0.1);
    setTimeout(() => playTone(250, 0.2, 'sawtooth', 0.1), 100);
    setTimeout(() => playNoise(0.15, 0.06), 150);
  },
  scoreUp: () => {
    playTone(1000, 0.06, 'sine', 0.06);
  },
  milestone: () => {
    playTone(523, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.08, 'sine', 0.12), 60);
    setTimeout(() => playTone(784, 0.08, 'sine', 0.12), 120);
    setTimeout(() => playTone(1047, 0.2, 'sine', 0.15), 180);
  },
  gameOver: () => {
    playTone(400, 0.15, 'sawtooth', 0.08);
    setTimeout(() => playTone(350, 0.15, 'sawtooth', 0.08), 150);
    setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.08), 300);
  },
};

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      enabledRef.current = next;
      if (next) {
        // Warm up audio context
        getAudioContext();
        playTone(0, 0.01, 'sine', 0);
      }
      return next;
    });
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    try {
      soundEffects[sound]();
    } catch {
      // Silently fail
    }
  }, []);

  return useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
}
