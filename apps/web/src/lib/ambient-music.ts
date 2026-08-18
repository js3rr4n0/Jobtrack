import type { ThemeId } from '@/lib/themes';

/** Nota de una melodia. `semitone` en null equivale a un silencio. */
export interface MusicNote {
  readonly semitone: number | null;
  readonly beats: number;
}

/**
 * Un ambiente es una pieza corta y repetible: melodia, bajo, tempo y timbres.
 * Todo se sintetiza en el navegador con Web Audio, sin archivos ni material
 * sujeto a derechos de autor.
 */
export interface Soundscape {
  readonly id: string;
  readonly label: string;
  readonly rootFrequency: number;
  readonly bpm: number;
  readonly melody: readonly MusicNote[];
  readonly bass: readonly MusicNote[];
  readonly leadWaveform: OscillatorType;
  readonly bassWaveform: OscillatorType;
  /** Corte del filtro paso bajo aplicado a la melodia. */
  readonly filterHz: number;
  /** Segundos de ataque: valores bajos dan notas definidas, no barridos. */
  readonly attackSeconds: number;
  /** Proporcion de la nota que suena antes de soltar; ligado si se acerca a 1. */
  readonly sustainRatio: number;
}

const note = (semitone: number | null, beats = 1): MusicNote => ({ semitone, beats });

/** Ambiente sereno: melodia amable sobre un ciclo I - IV - vi - V. */
const CALM: Soundscape = {
  id: 'calm',
  label: 'Jingle sereno',
  rootFrequency: 261.63,
  bpm: 88,
  melody: [
    note(12), note(16, 0.5), note(19, 0.5), note(16),
    note(21), note(19), note(16), note(14),
    note(12), note(16, 0.5), note(21, 0.5), note(19),
    note(16), note(14), note(12, 4),
  ],
  bass: [note(0, 4), note(5, 4), note(9, 4), note(7, 4)],
  leadWaveform: 'triangle',
  bassWaveform: 'sine',
  filterHz: 2600,
  attackSeconds: 0.02,
  sustainRatio: 0.9,
};

/** Chiptune saltarin de ocho bits, con bajo alterno como en las consolas. */
const CHIPTUNE: Soundscape = {
  id: 'chiptune',
  label: 'Jingle de arcade',
  rootFrequency: 261.63,
  bpm: 144,
  melody: [
    note(12, 0.5), note(12, 0.5), note(19, 0.5), note(16, 0.5),
    note(12, 0.5), note(16, 0.5), note(19),
    note(17, 0.5), note(17, 0.5), note(14, 0.5), note(17, 0.5),
    note(19, 0.5), note(16, 0.5), note(12),
    note(19, 0.5), note(21, 0.5), note(24, 0.5), note(21, 0.5),
    note(19, 0.5), note(16, 0.5), note(19),
    note(17, 0.5), note(19, 0.5), note(21, 0.5), note(19, 0.5),
    note(16, 0.5), note(14, 0.5), note(12),
  ],
  bass: [
    note(0, 0.5), note(7, 0.5), note(0, 0.5), note(7, 0.5),
    note(0, 0.5), note(7, 0.5), note(0, 0.5), note(7, 0.5),
    note(5, 0.5), note(12, 0.5), note(5, 0.5), note(12, 0.5),
    note(7, 0.5), note(14, 0.5), note(7, 0.5), note(14, 0.5),
    note(9, 0.5), note(16, 0.5), note(9, 0.5), note(16, 0.5),
    note(9, 0.5), note(16, 0.5), note(9, 0.5), note(16, 0.5),
    note(5, 0.5), note(12, 0.5), note(5, 0.5), note(12, 0.5),
    note(7, 0.5), note(14, 0.5), note(7, 0.5), note(14, 0.5),
  ],
  leadWaveform: 'square',
  bassWaveform: 'triangle',
  filterHz: 4200,
  attackSeconds: 0.005,
  sustainRatio: 0.72,
};

/** Pulso neon: arpegio menor continuo con bajo insistente. */
const SYNTHWAVE: Soundscape = {
  id: 'synthwave',
  label: 'Jingle neon',
  rootFrequency: 220,
  bpm: 112,
  melody: [
    note(12, 0.5), note(15, 0.5), note(19, 0.5), note(22, 0.5),
    note(19, 0.5), note(15, 0.5), note(12, 0.5), note(15, 0.5),
    note(10, 0.5), note(14, 0.5), note(17, 0.5), note(22, 0.5),
    note(17, 0.5), note(14, 0.5), note(10, 0.5), note(14, 0.5),
  ],
  bass: [note(0, 2), note(0, 2), note(-2, 2), note(-2, 2)],
  leadWaveform: 'sawtooth',
  bassWaveform: 'square',
  filterHz: 1700,
  attackSeconds: 0.01,
  sustainRatio: 0.85,
};

/** Melodia luminosa y ligada, sin barridos ni notas sueltas. */
const BRIGHT: Soundscape = {
  id: 'bright',
  label: 'Jingle luminoso',
  rootFrequency: 293.66,
  bpm: 120,
  melody: [
    note(16, 0.5), note(19, 0.5), note(21), note(19, 0.5), note(16, 0.5), note(14),
    note(16, 0.5), note(19, 0.5), note(23), note(21, 0.5), note(19, 0.5), note(16),
    note(14, 0.5), note(12, 0.5), note(14), note(16), note(19),
    note(21), note(19), note(16, 2),
  ],
  bass: [note(0, 4), note(9, 4), note(5, 4), note(7, 4)],
  leadWaveform: 'triangle',
  bassWaveform: 'sine',
  filterHz: 3200,
  attackSeconds: 0.015,
  sustainRatio: 0.95,
};

/** Nebulosa: notas largas y encadenadas, pero con motivo reconocible. */
const SPACE: Soundscape = {
  id: 'space',
  label: 'Jingle estelar',
  rootFrequency: 196,
  bpm: 66,
  melody: [
    note(12, 2), note(16, 1), note(19, 1),
    note(18, 2), note(16, 2),
    note(14, 2), note(19, 1), note(16, 1),
    note(12, 4),
  ],
  bass: [note(0, 4), note(-3, 4), note(-5, 4), note(0, 4)],
  leadWaveform: 'sine',
  bassWaveform: 'sine',
  filterHz: 1500,
  attackSeconds: 0.05,
  sustainRatio: 0.98,
};

const SOUNDSCAPE_BY_THEME: Readonly<Record<ThemeId, Soundscape>> = {
  light: CALM,
  dark: CALM,
  minimal: CALM,
  'pixel-pink': CHIPTUNE,
  'pixel-blue': CHIPTUNE,
  gaming: SYNTHWAVE,
  anime: BRIGHT,
  galaxy: SPACE,
};

export function soundscapeForTheme(theme: ThemeId): Soundscape {
  return SOUNDSCAPE_BY_THEME[theme] ?? CALM;
}

export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

/** Duracion de una vuelta completa, en segundos. */
export function loopDurationSeconds(soundscape: Soundscape): number {
  const beats = soundscape.melody.reduce((total, item) => total + item.beats, 0);
  return beats * secondsPerBeat(soundscape.bpm);
}

export function frequencyForSemitone(rootFrequency: number, semitone: number): number {
  return rootFrequency * Math.pow(2, semitone / 12);
}

/** Volumen deliberadamente bajo: la musica acompana, no compite con la interfaz. */
const MASTER_GAIN = 0.06;
const BASS_GAIN = 0.5;
/** Margen con el que se encola la vuelta siguiente para que no se oiga la costura. */
const RESCHEDULE_MARGIN_SECONDS = 0.3;

type AudioContextConstructor = new () => AudioContext;

function resolveAudioContext(): AudioContextConstructor | null {
  return (
    (globalThis as { AudioContext?: AudioContextConstructor }).AudioContext ??
    (globalThis as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext ??
    null
  );
}

/**
 * Reproductor de fondo. Debe iniciarse desde una interaccion del usuario: los
 * navegadores bloquean el audio automatico, y ademas es lo correcto para algo
 * que suena sin que nadie lo pida.
 *
 * Cada vuelta se encola completa en el reloj de audio, no con temporizadores de
 * interfaz, de modo que el ritmo no se desajusta aunque la pestana este ocupada.
 */
export class AmbientMusicPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private soundscape: Soundscape = CALM;
  private running = false;

  get isPlaying(): boolean {
    return this.running;
  }

  async start(soundscape: Soundscape): Promise<boolean> {
    this.soundscape = soundscape;

    const AudioContextClass = resolveAudioContext();

    if (!AudioContextClass) {
      return false;
    }

    try {
      if (!this.context) {
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = MASTER_GAIN;
        this.master.connect(this.context.destination);
      }

      await this.context.resume();
    } catch {
      return false;
    }

    this.running = true;
    this.queueLoop(this.context.currentTime + 0.1);
    return true;
  }

  setSoundscape(soundscape: Soundscape): void {
    const wasPlaying = this.running;
    this.stop();
    this.soundscape = soundscape;

    if (wasPlaying && this.context) {
      this.running = true;
      this.queueLoop(this.context.currentTime + 0.1);
    }
  }

  stop(): void {
    this.running = false;

    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async dispose(): Promise<void> {
    this.stop();
    await this.context?.close().catch(() => undefined);
    this.context = null;
    this.master = null;
  }

  private queueLoop(startAt: number): void {
    const context = this.context;

    if (!context || !this.running) {
      return;
    }

    const soundscape = this.soundscape;
    const beat = secondsPerBeat(soundscape.bpm);

    this.queueVoice(soundscape.melody, startAt, beat, soundscape.leadWaveform, 1, soundscape.filterHz);
    this.queueVoice(soundscape.bass, startAt, beat, soundscape.bassWaveform, BASS_GAIN, 500, -12);

    const duration = loopDurationSeconds(soundscape);
    const delayMs = Math.max((duration - RESCHEDULE_MARGIN_SECONDS) * 1000, 50);

    this.timer = setTimeout(() => this.queueLoop(startAt + duration), delayMs);
  }

  private queueVoice(
    voice: readonly MusicNote[],
    startAt: number,
    beat: number,
    waveform: OscillatorType,
    gain: number,
    filterHz: number,
    transpose = 0,
  ): void {
    const context = this.context;
    const master = this.master;

    if (!context || !master) {
      return;
    }

    let cursor = startAt;

    for (const item of voice) {
      const duration = item.beats * beat;

      if (item.semitone !== null) {
        this.queueNote(item.semitone + transpose, cursor, duration, waveform, gain, filterHz);
      }

      cursor += duration;
    }
  }

  private queueNote(
    semitone: number,
    startAt: number,
    duration: number,
    waveform: OscillatorType,
    gain: number,
    filterHz: number,
  ): void {
    const context = this.context;
    const master = this.master;

    if (!context || !master) {
      return;
    }

    const { attackSeconds, sustainRatio, rootFrequency } = this.soundscape;
    const audible = Math.max(duration * sustainRatio, 0.05);
    const attack = Math.min(attackSeconds, audible / 2);

    const oscillator = context.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequencyForSemitone(rootFrequency, semitone);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterHz;

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(gain, startAt + attack);
    envelope.gain.setValueAtTime(gain, startAt + audible * 0.8);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + audible);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);

    oscillator.start(startAt);
    oscillator.stop(startAt + audible + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }
}
