'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TOUR_STEPS, type SpotlightRect, padRect } from '@/lib/guided-tour';

const SPOTLIGHT_PADDING = 10;

function measure(target: string): SpotlightRect | null {
  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);

  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return padRect(
    { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    SPOTLIGHT_PADDING,
  );
}

export interface GuidedTourProps {
  onFinish: () => void;
}

/**
 * Tutorial de primera vez. En lugar de una capa con recorte, se dibujan cuatro
 * paneles desenfocados alrededor del elemento destacado: así el área útil queda
 * nitida y sigue siendo visible mientras el resto se atenua.
 */
export function GuidedTour({ onFinish }: GuidedTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const step = TOUR_STEPS[index];

  useEffect(() => {
    const update = () => setRect(measure(step.target));

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step.target]);

  const advance = useCallback(() => {
    if (index + 1 < TOUR_STEPS.length) {
      setIndex(index + 1);
      return;
    }
    onFinish();
  }, [index, onFinish]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onFinish();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFinish]);

  const panel = 'fixed z-40 bg-black/55 backdrop-blur-sm';
  const isLastStep = index + 1 === TOUR_STEPS.length;

  return (
    <div role="dialog" aria-modal="true" aria-label="Tutorial de bienvenida">
      {rect ? (
        <>
          <div className={panel} style={{ top: 0, left: 0, right: 0, height: rect.top }} />
          <div
            className={panel}
            style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className={panel}
            style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
          />
          <div
            className={panel}
            style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-40 rounded-card border-2 border-accent"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className={`${panel} inset-0`} />
      )}

      <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-card border border-accent bg-overlay p-5 shadow-raised">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Paso {index + 1} de {TOUR_STEPS.length}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-primary">{step.title}</h2>
        <p className="mt-1 text-sm text-secondary">{step.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onFinish}>
            Saltar
          </Button>
          <Button onClick={advance}>{isLastStep ? 'Entendido' : 'Siguiente'}</Button>
        </div>
      </div>
    </div>
  );
}
