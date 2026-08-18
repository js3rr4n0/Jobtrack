import type { ThemeId } from '@/lib/themes';

/**
 * Descripcion de un ambiente sonoro. La musica se sintetiza en el navegador
 * con Web Audio, sin archivos ni dependencias externas, de modo que no hay
 * material sujeto a derechos de autor y el peso de la aplicacion no cambia.
 */
export interface Soundscape {
  readonly id: string;
  readonly label: string;
  readonly waveform: OscillatorType;
  /** Grados de la escala en semitonos sobre la nota base. */
  readonly scale: readonly number[];
  readonly rootFrequency: number;
  /** Milisegundos entre notas. */
  readonly tempoMs: number;
  /** Duracion audible de cada nota, en segundos. */
  readonly noteSeconds: number;
  /** Corte del filtro paso bajo, en hercios. */
  readonly filterHz: number;
  readonly detuneCents: number;
}

const CALM: Soundscape = {
  id: 'calm',
  label: 'Ambiente sereno',
  waveform: 'sine',
  scale: [0, 3, 5, 7, 10, 12],
  rootFrequency: 196,
  tempoMs: 2600,
  noteSeconds: 4.5,
  filterHz: 900,
  detuneCents: 0,
};

const CHIPTUNE: Soundscape = {
  id: 'chiptune',
  label: 'Arpegio retro',
  waveform: 'square',
  scale: [0, 4, 7, 12, 7, 4],
  rootFrequency: 262,
  tempoMs: 420,
  noteSeconds: 0.32,
  filterHz: 2200,
  detuneCents: 0,
};

const SYNTHWAVE: Soundscape = {
  id: 'synthwave',
  label: 'Pulso neon',
  waveform: 'sawtooth',
  scale: [0, 3, 7, 10, 12, 10],
  rootFrequency: 147,
  tempoMs: 900,
  noteSeconds: 1.1,
  filterHz: 700,
  detuneCents: 6,
};

const BRIGHT: Soundscape = {
  id: 'bright',
  label: 'Melodia luminosa',
  waveform: 'triangle',
  scale: [0, 2, 4, 7, 9, 12],
  rootFrequency: 330,
  tempoMs: 1300,
  noteSeconds: 1.8,
  filterHz: 1800,
  detuneCents: 0,
};

const SPACE: Soundscape = {
  id: 'space',
  label: 'Nebulosa',
  waveform: 'sine',
  scale: [0, 2, 6, 7, 11, 14],
  rootFrequency: 131,
  tempoMs: 3400,
  noteSeconds: 6,
  filterHz: 600,
  detuneCents: 9,
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

/** Ambiente que corresponde a cada tema visual. */
export function soundscapeForTheme(theme: ThemeId): Soundscape {
  return SOUNDSCAPE_BY_THEME[theme] ?? CALM;
}

/** Frecuencia del grado indicado, con temperamento igual. */
export function frequencyForStep(soundscape: Soundscape, step: number): number {
  const degree = soundscape.scale[Math.abs(step) % soundscape.scale.length];
  const octave = Math.floor((Math.abs(step) / soundscape.scale.length) % 2);
  return soundscape.rootFrequency * Math.pow(2, (degree + octave * 12) / 12);
}

/** Volumen deliberadamente bajo: la musica acompana, no compite con la interfaz. */
const MASTER_GAIN = 0.05;

type AudioContextConstructor = new () => AudioContext;

function resolveAudioContext(): AudioContextConstructor | null {
  const candidate =
    (globalThis as { AudioContext?: AudioContextConstructor }).AudioContext ??
    (globalThis as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;

  return candidate ?? null;
}

/**
 * Reproductor de fondo. Debe iniciarse desde una interaccion del usuario: los
 * navegadores bloquean el audio automatico, y ademas es lo correcto para algo
 * que suena sin que nadie lo pida.
 */
export class AmbientMusicPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private soundscape: Soundscape = CALM;
  private step = 0;

  get isPlaying(): boolean {
    return this.timer !== null;
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

    this.schedule();
    return true;
  }

  setSoundscape(soundscape: Soundscape): void {
    this.soundscape = soundscape;
    this.step = 0;

    if (this.isPlaying) {
      this.schedule();
    }
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Libera el contexto de audio; usarlo al desmontar la aplicacion. */
  async dispose(): Promise<void> {
    this.stop();
    await this.context?.close().catch(() => undefined);
    this.context = null;
    this.master = null;
  }

  private schedule(): void {
    this.stop();
    this.playNote();
    this.timer = setInterval(() => this.playNote(), this.soundscape.tempoMs);
  }

  private playNote(): void {
    const context = this.context;
    const master = this.master;

    if (!context || !master) {
      return;
    }

    const { waveform, noteSeconds, filterHz, detuneCents } = this.soundscape;
    const startedAt = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequencyForStep(this.soundscape, this.step);
    oscillator.detune.value = detuneCents;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterHz;

    // Entrada y salida suaves para que ninguna nota chasquee.
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, startedAt);
    envelope.gain.linearRampToValueAtTime(1, startedAt + noteSeconds * 0.25);
    envelope.gain.linearRampToValueAtTime(0, startedAt + noteSeconds);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);

    oscillator.start(startedAt);
    oscillator.stop(startedAt + noteSeconds);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };

    this.step += 1;
  }
}
