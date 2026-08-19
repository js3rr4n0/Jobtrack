'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  APPLICATION_STATUSES,
  type CreateJobApplicationInput,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_CATALOG,
  WORK_MODES,
  WORK_MODE_LABELS,
} from '@jobtrack/contracts';

import { Button } from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField';
import {
  type ApplicationFormValues,
  EMPTY_FORM_VALUES,
  type FormErrors,
  toApplicationInput,
  validateApplicationForm,
} from '@/lib/application-form';

const STATUS_OPTIONS = APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: STATUS_CATALOG[status].label,
}));

const PRIORITY_OPTIONS = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_LABELS[priority],
}));

const WORK_MODE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  ...WORK_MODES.map((mode) => ({ value: mode, label: WORK_MODE_LABELS[mode] })),
];

export interface ApplicationFormProps {
  initialValues?: ApplicationFormValues;
  /** Áreas ya usadas, ofrecidas como sugerencias al escribir. */
  knownCategories?: readonly string[];
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: CreateJobApplicationInput) => void;
  onCancel: () => void;
}

/** Formulario de captura manual de una oferta de empleo. */
/**
 * Grupo de campos con su encabezado. Once campos seguidos se leen como un
 * muro; repartidos en tres bloques con nombre, se recorren de un vistazo y se
 * entiende que pide cada parte.
 */
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function ApplicationForm({
  initialValues = EMPTY_FORM_VALUES,
  knownCategories = [],
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = <Field extends keyof ApplicationFormValues>(
    field: Field,
    value: ApplicationFormValues[Field],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateApplicationForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(toApplicationInput(values));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <datalist id="áreas-conocidas">
        {knownCategories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <FormSection title="La vacante">
        <TextField
          id="company"
          label="Empresa"
          required
          value={values.company}
          error={errors.company}
          onChange={(event) => updateField('company', event.target.value)}
        />
        <TextField
          id="position"
          label="Puesto"
          required
          value={values.position}
          error={errors.position}
          onChange={(event) => updateField('position', event.target.value)}
        />
        <SelectField
          id="status"
          label="Estado"
          options={STATUS_OPTIONS}
          value={values.status}
          hint={STATUS_CATALOG[values.status].description}
          onChange={(event) =>
            updateField('status', event.target.value as ApplicationFormValues['status'])
          }
        />
        <SelectField
          id="priority"
          label="Prioridad"
          options={PRIORITY_OPTIONS}
          value={values.priority}
          onChange={(event) =>
            updateField('priority', event.target.value as ApplicationFormValues['priority'])
          }
        />
      </FormSection>

      <FormSection title="Dónde y cuánto">
        <TextField
          id="category"
          label="Área del tablero"
          list="áreas-conocidas"
          value={values.category}
          error={errors.category}
          hint="Por ejemplo: Desarrollo, Marketing, Diseño."
          onChange={(event) => updateField('category', event.target.value)}
        />
        <TextField
          id="location"
          label="Ubicación"
          value={values.location}
          error={errors.location}
          placeholder="Ciudad o pais"
          onChange={(event) => updateField('location', event.target.value)}
        />
        <SelectField
          id="workMode"
          label="Modalidad"
          options={WORK_MODE_OPTIONS}
          value={values.workMode}
          onChange={(event) =>
            updateField('workMode', event.target.value as ApplicationFormValues['workMode'])
          }
        />
        <TextField
          id="salaryExpectation"
          label="Expectativa salarial"
          inputMode="numeric"
          value={values.salaryExpectation}
          error={errors.salaryExpectation}
          hint="Opcional. Solo números enteros."
          onChange={(event) => updateField('salaryExpectation', event.target.value)}
        />
        <TextField
          id="sourceUrl"
          label="Enlace de la vacante"
          type="url"
          value={values.sourceUrl}
          error={errors.sourceUrl}
          placeholder="https://"
          onChange={(event) => updateField('sourceUrl', event.target.value)}
        />
        <TextField
          id="contact"
          label="Contacto"
          value={values.contact}
          error={errors.contact}
          placeholder="Nombre, correo o teléfono"
          hint="Quién lleva el proceso dentro de la empresa."
          onChange={(event) => updateField('contact', event.target.value)}
        />
      </FormSection>

      <FormSection title="Qué enviaste">
        <TextField
          id="resumeVersion"
          label="Versión del currículum"
          value={values.resumeVersion}
          error={errors.resumeVersion}
          placeholder="Por ejemplo: CV backend v3"
          hint="Para saber cuál defender en la entrevista."
          onChange={(event) => updateField('resumeVersion', event.target.value)}
        />
        <TextField
          id="coverLetterVersion"
          label="Versión de la carta"
          value={values.coverLetterVersion}
          error={errors.coverLetterVersion}
          placeholder="Por ejemplo: Carta producto v2"
          onChange={(event) => updateField('coverLetterVersion', event.target.value)}
        />
      </FormSection>

      <FormSection title="Fechas y notas">
        <TextField
          id="appliedAt"
          label="Fecha de postulación"
          type="date"
          value={values.appliedAt}
          error={errors.appliedAt}
          onChange={(event) => updateField('appliedAt', event.target.value)}
        />
        <TextField
          id="interviewAt"
          label="Fecha de entrevista"
          type="datetime-local"
          value={values.interviewAt}
          error={errors.interviewAt}
          onChange={(event) => updateField('interviewAt', event.target.value)}
        />
        <TextField
          id="followUpAt"
          label="Fecha de seguimiento"
          type="date"
          value={values.followUpAt}
          error={errors.followUpAt}
          hint="El día que toca volver a escribir si no hay respuesta."
          onChange={(event) => updateField('followUpAt', event.target.value)}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            id="notes"
            label="Notas"
            value={values.notes}
            error={errors.notes}
            hint="Contactos, preguntas de la entrevista o siguientes pasos."
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
