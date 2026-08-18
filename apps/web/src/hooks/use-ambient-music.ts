'use client';

import { useEffect, useRef } from 'react';

import { AmbientMusicPlayer, soundscapeForTheme } from '@/lib/ambient-music';
import type { ThemeId } from '@/lib/themes';

/**
 * Mantiene la musica de fondo alineada con la preferencia y con el tema activo.
 * El reproductor vive en una referencia para que cambiar de tema no reinicie el
 * contexto de audio.
 */
export function useAmbientMusic(enabled: boolean, theme: ThemeId): void {
  const playerRef = useRef<AmbientMusicPlayer | null>(null);

  useEffect(() => {
    const player = playerRef.current ?? new AmbientMusicPlayer();
    playerRef.current = player;

    if (!enabled) {
      player.stop();
      return;
    }

    const soundscape = soundscapeForTheme(theme);

    if (player.isPlaying) {
      player.setSoundscape(soundscape);
    } else {
      void player.start(soundscape);
    }
  }, [enabled, theme]);

  useEffect(() => () => void playerRef.current?.dispose(), []);
}
