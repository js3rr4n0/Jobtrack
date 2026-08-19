import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationForm } from '@/components/board/ApplicationForm';
import { renderWithPreferences } from '../../../tests/render-helpers';
import { emptyDocuments } from '../../../tests/document-doubles';

const renderForm = (overrides: Partial<Parameters<typeof ApplicationForm>[0]> = {}) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  renderWithPreferences(
    <ApplicationForm
resumes={emptyDocuments()} coverLetters={emptyDocuments()}       submitLabel="Guardar postulación"
      isSubmitting={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  );

  return { onSubmit, onCancel };
};

describe('ApplicationForm', () => {
  it('muestra mensajes de error legibles al enviar campos vacíos', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    expect(await screen.findByText('Escribe el nombre de la empresa.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el puesto al que postulas.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('no envia datos corruptos cuando la expectativa salarial no es numérica', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText('Empresa'), 'Estudio Pixel');
    await user.type(screen.getByLabelText('Puesto'), 'Desarrollador');
    await user.click(screen.getByRole('button', { name: /Más detalles/ }));
    await user.type(screen.getByLabelText('Expectativa salarial'), 'mucho');
    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    expect(await screen.findByText('Usa solo números enteros, sin puntos ni comas.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia el contrato esperado cuando los datos son validos', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText('Empresa'), '  Estudio Pixel  ');
    await user.type(screen.getByLabelText('Puesto'), 'Desarrollador Frontend');
    await user.selectOptions(screen.getByLabelText('Estado'), 'applied');
    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'Estudio Pixel',
        position: 'Desarrollador Frontend',
        status: 'applied',
        notes: null,
        location: null,
      }),
    );
  });

  it('limpia el error de un campo en cuanto la persona lo corrige', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));
    expect(await screen.findByText('Escribe el nombre de la empresa.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Empresa'), 'E');

    await waitFor(() =>
      expect(screen.queryByText('Escribe el nombre de la empresa.')).not.toBeInTheDocument(),
    );
  });

  it('bloquea el envío mientras la petición está en curso', () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('permite cancelar sin enviar nada', async () => {
    const user = userEvent.setup();
    const { onCancel, onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ApplicationForm: campos opcionales', () => {
  it('abre con lo esencial y guarda el resto plegado', () => {
    renderWithPreferences(
      <ApplicationForm resumes={emptyDocuments()} coverLetters={emptyDocuments()} submitLabel="Guardar" isSubmitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByLabelText('Empresa')).toBeInTheDocument();
    expect(screen.getByLabelText('Enlace de la vacante')).toBeInTheDocument();
    expect(screen.queryByLabelText('Expectativa salarial')).not.toBeInTheDocument();
  });

  it('despliega los campos opcionales cuando se piden', async () => {
    const user = userEvent.setup();
    renderWithPreferences(
      <ApplicationForm resumes={emptyDocuments()} coverLetters={emptyDocuments()} submitLabel="Guardar" isSubmitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /Más detalles/ }));

    expect(screen.getByLabelText('Contacto')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de seguimiento')).toBeInTheDocument();
  });
});
