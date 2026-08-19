import { describe, expect, it } from 'vitest';
import { buildJobApplication } from '@jobtrack/contracts';

import {
  EMPTY_FORM_VALUES,
  type ApplicationFormValues,
  fromApplication,
  toApplicationInput,
  toIsoDate,
  toLocalDateTimeValue,
  validateApplicationForm,
} from './application-form';

const valuesWith = (overrides: Partial<ApplicationFormValues>): ApplicationFormValues => ({
  ...EMPTY_FORM_VALUES,
  company: 'Empresa Ejemplo',
  position: 'Desarrollador',
  ...overrides,
});

describe('validateApplicationForm', () => {
  it('exige empresa y puesto', () => {
    const errors = validateApplicationForm(EMPTY_FORM_VALUES);

    expect(errors.company).toBe('Escribe el nombre de la empresa.');
    expect(errors.position).toBe('Escribe el puesto al que postulas.');
  });

  it('trata los campos con solo espacios como vacíos', () => {
    const errors = validateApplicationForm(valuesWith({ company: '    ', position: '  ' }));

    expect(errors.company).toBeDefined();
    expect(errors.position).toBeDefined();
  });

  it('acepta un formulario con los datos mínimos', () => {
    expect(validateApplicationForm(valuesWith({}))).toEqual({});
  });

  it('rechaza una expectativa salarial no numérica', () => {
    const errors = validateApplicationForm(valuesWith({ salaryExpectation: 'mucho dinero' }));

    expect(errors.salaryExpectation).toBe('Usa solo números enteros, sin puntos ni comas.');
  });

  it('rechaza una expectativa salarial negativa', () => {
    const errors = validateApplicationForm(valuesWith({ salaryExpectation: '-100' }));

    expect(errors.salaryExpectation).toBe('La expectativa salarial no puede ser negativa.');
  });

  it('acepta una expectativa salarial vacía por ser opcional', () => {
    expect(validateApplicationForm(valuesWith({ salaryExpectation: '' })).salaryExpectation).toBeUndefined();
  });

  it('rechaza enlaces sin protocolo', () => {
    const errors = validateApplicationForm(valuesWith({ sourceUrl: 'empresa.com/vacante' }));

    expect(errors.sourceUrl).toBeDefined();
  });

  it('acepta enlaces https validos', () => {
    const errors = validateApplicationForm(valuesWith({ sourceUrl: 'https://empresa.com/vacante' }));

    expect(errors.sourceUrl).toBeUndefined();
  });

  it('rechaza una fecha de entrevista ilegible', () => {
    const errors = validateApplicationForm(valuesWith({ interviewAt: '30 de febrero' }));

    expect(errors.interviewAt).toBe('Revisa la fecha y hora de la entrevista.');
  });

  it('rechaza textos que superan el límite de caracteres', () => {
    const errors = validateApplicationForm(valuesWith({ company: 'a'.repeat(121) }));

    expect(errors.company).toContain('120 caracteres');
  });
});

describe('toApplicationInput', () => {
  it('recorta los textos y convierte los vacíos en nulos', () => {
    const input = toApplicationInput(
      valuesWith({ company: '  Empresa  ', location: '   ', notes: '' }),
    );

    expect(input.company).toBe('Empresa');
    expect(input.location).toBeNull();
    expect(input.notes).toBeNull();
  });

  it('convierte la modalidad vacía en nulo', () => {
    expect(toApplicationInput(valuesWith({ workMode: '' })).workMode).toBeNull();
  });

  it('convierte la expectativa salarial a número', () => {
    expect(toApplicationInput(valuesWith({ salaryExpectation: '15000' })).salaryExpectation).toBe(
      15000,
    );
  });
});

describe('conversion de fechas', () => {
  it('devuelve nulo para valores vacíos o invalidos', () => {
    expect(toIsoDate('')).toBeNull();
    expect(toIsoDate('no es fecha')).toBeNull();
  });

  it('convierte una fecha válida a ISO 8601', () => {
    expect(toIsoDate('2026-03-01T10:00')).toMatch(/^2026-03-01T/);
  });

  it('devuelve una cadena vacía al formatear fechas nulas o corruptas', () => {
    expect(toLocalDateTimeValue(null)).toBe('');
    expect(toLocalDateTimeValue('fecha-rota')).toBe('');
  });

  it('es reversible entre el formulario y el contrato', () => {
    const iso = toIsoDate('2026-03-01T10:30');

    expect(toLocalDateTimeValue(iso)).toBe('2026-03-01T10:30');
  });
});

describe('fromApplication', () => {
  it('convierte los campos nulos en cadenas vacías para el formulario', () => {
    const values = fromApplication(
      buildJobApplication({ location: null, notes: null, salaryExpectation: null }),
    );

    expect(values.location).toBe('');
    expect(values.notes).toBe('');
    expect(values.salaryExpectation).toBe('');
  });

  it('conserva los datos existentes', () => {
    const values = fromApplication(
      buildJobApplication({ company: 'Estudio Pixel', status: 'interview', priority: 'high' }),
    );

    expect(values.company).toBe('Estudio Pixel');
    expect(values.status).toBe('interview');
    expect(values.priority).toBe('high');
  });
});
