import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UploadProgress } from './UploadProgress';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('UploadProgress', () => {
  it('no dibuja nada en reposo', () => {
    const { container } = renderWithPreferences(
      <UploadProgress state="idle" fileName="CV.pdf" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('anuncia la primera fase mientras viaja el archivo', () => {
    renderWithPreferences(<UploadProgress state="uploading" fileName="CV.pdf" />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText(/Subiendo el archivo/)).toBeInTheDocument();
  });

  it('avanza a la segunda fase al registrarlo', () => {
    renderWithPreferences(<UploadProgress state="registering" fileName="CV.pdf" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('nombra el archivo en curso', () => {
    renderWithPreferences(<UploadProgress state="uploading" fileName="CV backend v3.pdf" />);

    expect(screen.getByText('CV backend v3.pdf')).toBeInTheDocument();
  });

  it('se anuncia a los lectores de pantalla sin robar el foco', () => {
    renderWithPreferences(<UploadProgress state="uploading" fileName="CV.pdf" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
