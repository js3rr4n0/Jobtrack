import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { PreferencesProvider } from '@/components/theme/PreferencesProvider';

function Wrapper({ children }: { children: ReactNode }) {
  return <PreferencesProvider>{children}</PreferencesProvider>;
}

/** Renderiza con el proveedor de preferencias, requerido por los componentes con iconos. */
export function renderWithPreferences(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}
