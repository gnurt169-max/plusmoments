'use client';

/**
 * Luxury Wedding Synthesizer & Audio Engine using Web Audio API
 * Generates delicate, romantic wedding piano & acoustic ambient melodies in real-time.
 * 100% in-browser, zero external network latency, zero 404s, zero CORS restrictions,
 * and guaranteed to work on both mobile Safari (iOS) and Chrome/Android.
 */

// Note frequency lookup table
const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23,
  'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46,
  'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'A#5': 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// Canon in D / Romantic Piano Melody Sequence (note, duration in seconds, velocity)
const ROMANTIC_PIANO_SCORE: Array<[string, number, number]> = [
  // Phrase 1: Canon in D opening chords & gentle arpeggio
  ['D4', 0.8, 0.6], ['F#4', 0.8, 0.5], ['A4', 0.8, 0.7], ['D5', 1.2, 0.8],
  ['A3', 0.8, 0.5], ['C#4', 0.8, 0.5], ['E4', 0.8, 0.6], ['A4', 1.2, 0.7],
  ['B3', 0.8, 0.6], ['D4', 0.8, 0.5], ['F#4', 0.8, 0.6], ['B4', 1.2, 0.7],
  ['F#3', 0.8, 0.5], ['A3', 0.8, 0.5], ['C#4', 0.8, 0.5], ['F#4', 1.2, 0.6],
  ['G3', 0.8, 0.6], ['B3', 0.8, 0.5], ['D4', 0.8, 0.6], ['G4', 1.2, 0.7],
  ['D3', 0.8, 0.5], ['F#3', 0.8, 0.5], ['A3', 0.8, 0.5], ['D4', 1.2, 0.6],
  ['G3', 0.8, 0.5], ['B3', 0.8, 0.5], ['D4', 0.8, 0.6], ['G4', 1.2, 0.7],
  ['A3', 0.8, 0.6], ['C#4', 0.8, 0.6], ['E4', 0.8, 0.7], ['A4', 1.4, 0.8],

  // Phrase 2: Beautiful high melody
  ['F#5', 0.6, 0.75], ['E5', 0.6, 0.7], ['D5', 0.6, 0.8], ['C#5', 0.6, 0.7],
  ['B4', 0.6, 0.75], ['A4', 0.6, 0.7], ['B4', 0.6, 0.75], ['C#5', 0.8, 0.8],
  ['D5', 1.0, 0.85], ['F#5', 0.8, 0.8], ['E5', 1.0, 0.8], ['A5', 1.6, 0.9],
  ['F#5', 0.6, 0.75], ['G5', 0.6, 0.8], ['A5', 1.2, 0.85], ['F#5', 0.6, 0.7],
  ['E5', 0.6, 0.7], ['D5', 0.6, 0.75], ['E5', 1.2, 0.8], ['C#5', 0.8, 0.7],
  ['D5', 2.0, 0.85],
];

// Acoustic Love (Warm guitar & soft chime arpeggio)
const ACOUSTIC_LOVE_SCORE: Array<[string, number, number]> = [
  ['C4', 0.7, 0.6], ['E4', 0.7, 0.5], ['G4', 0.7, 0.6], ['C5', 1.2, 0.7],
  ['G3', 0.7, 0.5], ['B3', 0.7, 0.5], ['D4', 0.7, 0.6], ['G4', 1.2, 0.6],
  ['A3', 0.7, 0.6], ['C4', 0.7, 0.5], ['E4', 0.7, 0.6], ['A4', 1.2, 0.7],
  ['F3', 0.7, 0.6], ['A3', 0.7, 0.5], ['C4', 0.7, 0.6], ['F4', 1.4, 0.7],
  ['E5', 0.8, 0.75], ['D5', 0.8, 0.7], ['C5', 1.0, 0.8], ['G4', 1.4, 0.7],
  ['A4', 0.8, 0.75], ['B4', 0.8, 0.75], ['C5', 2.0, 0.85],
];

class WeddingAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timeoutId: any = null;
  private currentScoreIndex = 0;
  private activePreset = 'romantic-piano';
  private masterGain: GainNode | null = null;

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setPreset(presetId: string) {
    this.activePreset = presetId;
  }

  public play() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentScoreIndex = 0;
    this.playNextNote();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private playTone(freq: number, duration: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    // Natural grand piano / warm acoustic timbre (Fundamental + Soft Sub-Harmonic + Gentle Exponential Decay)
    osc.type = this.activePreset.includes('acoustic') ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 2, now); // Second harmonic adds acoustic shimmer

    const peak = Math.max(0.01, velocity * 0.22);

    // ADSR Envelope: Fast attack, natural exponential release
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(peak * 0.6, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.6);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(peak * 0.35, now + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

    osc.connect(gain);
    subOsc.connect(subGain);
    gain.connect(this.masterGain);
    subGain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration + 0.65);
    subOsc.stop(now + duration + 0.85);
  }

  private playNextNote = () => {
    if (!this.isPlaying || !this.ctx) return;

    const score = this.activePreset.includes('acoustic') ? ACOUSTIC_LOVE_SCORE : ROMANTIC_PIANO_SCORE;
    const [noteName, dur, vel] = score[this.currentScoreIndex % score.length];
    const freq = NOTE_FREQ[noteName];

    if (freq) {
      this.playTone(freq, dur, vel);
    }

    this.currentScoreIndex = (this.currentScoreIndex + 1) % score.length;
    this.timeoutId = setTimeout(this.playNextNote, dur * 1000 * 0.95);
  };
}

export const weddingAudioSynth = new WeddingAudioSynthesizer();
