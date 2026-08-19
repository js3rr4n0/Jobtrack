import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StoredDocument } from '@deska/contracts';

import { DocumentPicker } from './DocumentPicker';
import { renderWithPreferences } from '../../../tests/render-helpers';
import { documentsWith, emptyDocuments } from '../../../tests/document-doubles';

const CV: StoredDocument = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: 'ana',
  kind: 'resume',
  label: 'CV backend v3',
  storagePath: 'ana/resume/a.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  applicationId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const render = (props: Partial<React.ComponentProps<typeof DocumentPicker>> = {}) =>
  renderWithPreferences(
    <DocumentPicker
      id="resumeId"
      label="Currículum enviado"
      kind="resume"
      documents={emptyDocuments()}
      value=""
      onChange={vi.fn()}
      {...props}
    />,
  );

describe('DocumentPicker', () => {
  it('ofrece no adjuntar nada cuando no hay archivos', () => {
    render();

    expect(screen.getByLabelText('Currículum enviado')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Sin adjuntar' })).toBeInTheDocument();
  });

  it('lista los archivos ya subidos con su tamaño', () => {
    render({ documents: documentsWith([CV]) });

    expect(screen.getByRole('option', { name: /CV backend v3 \(2 kB\)/ })).toBeInTheDocument();
  });

  it('avisa del archivo elegido', () => {
    const onChange = vi.fn();
    render({ documents: documentsWith([CV]), onChange });

    fireEvent.change(screen.getByLabelText('Currículum enviado'), { target: { value: CV.id } });

    expect(onChange).toHaveBeenCalledWith(CV.id);
  });

  it('permite quitar el adjunto solo si hay uno', () => {
    const onChange = vi.fn();
    const { rerender } = render({ documents: documentsWith([CV]), value: CV.id, onChange });

    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(onChange).toHaveBeenCalledWith('');

    rerender(
      <DocumentPicker
        id="resumeId"
        label="Currículum enviado"
        kind="resume"
        documents={documentsWith([CV])}
        value=""
        onChange={onChange}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Quitar' })).not.toBeInTheDocument();
  });

  it('sube el archivo elegido y lo deja seleccionado', async () => {
    const onChange = vi.fn();
    const upload = vi.fn().mockResolvedValue(CV);
    render({ documents: emptyDocuments({ upload }), onChange });

    const file = new File(['contenido'], 'CV backend v3.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(upload).toHaveBeenCalled());
    expect(upload.mock.calls[0][1]).toBe('CV backend v3');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(CV.id));
  });

  it('no selecciona nada si la subida falla', async () => {
    const onChange = vi.fn();
    const upload = vi.fn().mockResolvedValue(null);
    render({ documents: emptyDocuments({ upload }), onChange });

    const file = new File(['x'], 'roto.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(upload).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('solo acepta los formatos de su clase', () => {
    render({ kind: 'resume' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('application/pdf');
  });

  it('muestra el fallo que reporta la subida', () => {
    render({ documents: emptyDocuments({ error: 'Solo se aceptan archivos PDF.' }) });

    expect(screen.getByRole('alert')).toHaveTextContent('Solo se aceptan archivos PDF.');
  });

  it('bloquea los controles mientras sube', () => {
    render({ documents: emptyDocuments({ uploadState: 'uploading' }) });

    expect(screen.getByLabelText('Currículum enviado')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Subir uno nuevo/ })).toBeDisabled();
  });
});
