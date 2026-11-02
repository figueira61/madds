import { parseNotes, type Note, type Wave } from './notes';
import { SONGS, type MusicName } from './songs';
import { SFX, type SfxName } from './sfx';

const LOOKAHEAD_S = 0.1;
const TICK_MS = 25;

interface TrackCursor {
  wave: Wave;
  volume: number;
  notes: Note[];
  index: number;
  nextTime: number;
}

/** Chiptune synthesizer on Web Audio. Every call is a no-op if audio is unavailable or fails. */
export class Synth {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private cursors: TrackCursor[] = [];
  private current: MusicName | null = null;
  private wanted: MusicName | null = null;
  private volumes = { music: 0.7, sfx: 0.8 };
  private gestureHooked = false;
  /** Mobile browsers only allow audio to start inside touchend/click/keydown, not touchstart: retry on each. */
  private readonly onGesture = () => {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'running') return;
    void ctx.resume().then(() => this.startWanted());
    this.startWanted();
  };

  /** Must run inside a user gesture (iOS Safari). */
  unlock(): void {
    try {
      if (!this.ctx) {
        const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
        const Ctor = w.AudioContext ?? w.webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
        this.noiseBuffer = this.makeNoise(this.ctx);
        this.applyVolumes();
      }
      void this.ctx.resume();
      this.hookGestures();
      this.startWanted();
    } catch {
      this.ctx = null;
    }
  }

  get unlocked(): boolean {
    return this.ctx?.state === 'running';
  }

  private startWanted(): void {
    if (this.ctx?.state === 'running' && this.wanted && !this.timer) this.playMusic(this.wanted);
  }

  private hookGestures(): void {
    if (this.gestureHooked || typeof document === 'undefined') return;
    this.gestureHooked = true;
    for (const type of ['touchend', 'pointerup', 'click', 'keydown']) document.addEventListener(type, this.onGesture, true);
  }

  setVolumes(music: number, sfx: number): void {
    this.volumes = { music, sfx };
    this.applyVolumes();
  }

  playMusic(name: MusicName): void {
    this.wanted = name;
    if (!this.ctx) return;
    if (this.current === name && this.timer) return;
    this.halt();
    try {
      const song = SONGS[name];
      const start = this.ctx.currentTime + 0.05;
      const beat = 60 / song.bpm;
      this.cursors = song.tracks.map((t) => ({ wave: t.wave, volume: t.volume, notes: parseNotes(t.notes), index: 0, nextTime: start }));
      this.current = name;
      this.timer = setInterval(() => this.schedule(beat, song.loop), TICK_MS);
      this.schedule(beat, song.loop);
    } catch {
      this.halt();
    }
  }

  stopMusic(): void {
    this.wanted = null;
    this.halt();
  }

  playSfx(name: SfxName): void {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      for (const s of SFX[name]) this.voice(s.wave, s.from, s.to, now + (s.at ?? 0) / 1000, s.ms / 1000, s.vol, this.sfxGain);
    } catch {
      // sound is never essential
    }
  }

  suspend(): void {
    try {
      void this.ctx?.suspend();
    } catch {
      // ignore
    }
  }

  resume(): void {
    try {
      void this.ctx?.resume();
    } catch {
      // ignore
    }
  }

  private halt(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.cursors = [];
    this.current = null;
  }

  private applyVolumes(): void {
    if (this.musicGain) this.musicGain.gain.value = this.volumes.music;
    if (this.sfxGain) this.sfxGain.gain.value = this.volumes.sfx;
  }

  private schedule(beat: number, loop: boolean): void {
    if (!this.ctx || !this.musicGain) return;
    const horizon = this.ctx.currentTime + LOOKAHEAD_S;
    let done = true;
    for (const c of this.cursors) {
      while (c.nextTime < horizon) {
        if (c.index >= c.notes.length) {
          if (!loop) break;
          c.index = 0;
        }
        const n = c.notes[c.index++];
        const dur = n.beats * beat;
        if (n.freq !== null) this.voice(c.wave, n.freq, n.freq, c.nextTime, dur * 0.9, c.volume, this.musicGain);
        c.nextTime += dur;
      }
      if (loop || c.index < c.notes.length) done = false;
    }
    if (done) {
      this.wanted = null;
      this.halt();
    }
  }

  private voice(wave: Wave, from: number, to: number, at: number, dur: number, vol: number, out: AudioNode): void {
    const ctx = this.ctx!;
    const end = at + Math.max(dur, 0.02);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, at);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    gain.connect(out);
    if (wave === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(from, at);
      filter.frequency.exponentialRampToValueAtTime(Math.max(to, 1), end);
      src.connect(filter).connect(gain);
      src.start(at);
      src.stop(end + 0.02);
    } else {
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(from, at);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, end);
      osc.connect(gain);
      osc.start(at);
      osc.stop(end + 0.02);
    }
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const synth = new Synth();
