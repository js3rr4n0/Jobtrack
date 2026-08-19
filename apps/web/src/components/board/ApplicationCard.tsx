'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobApplication,
  PRIORITY_LABELS,
  STATUS_CATALOG,
  WORK_MODE_LABELS,
  isFollowUpDue,
} from '@jobtrack/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { formatDate, formatDateTime } from '@/lib/format';

const PRIORITY_CLASSES: Record<JobApplication['priority'], string> = {
  low: 'text-secondary',
  medium: 'text-accent',
  high: 'text-warning',
};

export interface ApplicationCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  onStatusChange: (application: JobApplication, status: ApplicationStatus) => void;
}

/**
 * Tarjeta arrastrable. Además del arrastre, ofrece un selector de estado para
 * que el tablero siga siendo usable con teclado y en pantallas táctiles.
 */
export function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationCardProps) {
  const { iconPack } = usePreferences();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="surface-card animate-card-drop p-3 text-sm transition-shadow hover:shadow-lifted"
      aria-label={`${application.position} en ${application.company}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="focus-ring mt-0.5 cursor-grab touch-none rounded-control p-1 text-secondary hover:text-primary"
          {...attributes}
          {...listeners}
        >
          <Icon
            name="grip"
            pack={iconPack}
            size={16}
            title={`Arrastrar ${application.position}`}
          />
        </button>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-primary">{application.position}</h4>
          <p className="truncate text-xs text-secondary">{application.company}</p>
        </div>

        <span className={`text-xs font-medium ${PRIORITY_CLASSES[application.priority]}`}>
          {PRIORITY_LABELS[application.priority]}
        </span>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-secondary">
        {application.location ? (
          <div className="flex items-center gap-1.5">
            <dt className="visually-hidden">Ubicación</dt>
            <Icon name="location" pack={iconPack} size={14} />
            <dd className="truncate">
              {application.location}
              {application.workMode ? ` - ${WORK_MODE_LABELS[application.workMode]}` : ''}
            </dd>
          </div>
        ) : null}

        {application.interviewAt ? (
          <div className="flex items-center gap-1.5 text-accent">
            <dt className="visually-hidden">Entrevista</dt>
            <Icon name="calendar" pack={iconPack} size={14} />
            <dd>{formatDateTime(application.interviewAt)}</dd>
          </div>
        ) : null}

        {/*
          El seguimiento vencido se marca en color de aviso: es lo unico de la
          tarjeta que pide una accion hoy, y sin resaltarlo pasaria inadvertido
          entre las demas fechas.
        */}
        {application.followUpAt ? (
          <div
            className={`flex items-center gap-1.5 ${isFollowUpDue(application) ? 'font-semibold text-warning' : ''}`}
          >
            <dt className="visually-hidden">Fecha de seguimiento</dt>
            <Icon name="flag" pack={iconPack} size={14} />
            <dd>
              {isFollowUpDue(application) ? 'Toca seguimiento: ' : 'Seguimiento el '}
              {formatDate(application.followUpAt)}
            </dd>
          </div>
        ) : null}

        {application.contact ? (
          <div className="flex items-center gap-1.5">
            <dt className="visually-hidden">Contacto</dt>
            <Icon name="mic" pack={iconPack} size={14} />
            <dd className="truncate">{application.contact}</dd>
          </div>
        ) : null}

        {application.resumeVersion ? (
          <div className="flex items-center gap-1.5">
            <dt className="visually-hidden">Versión del currículum</dt>
            <Icon name="notebook" pack={iconPack} size={14} />
            <dd className="truncate">{application.resumeVersion}</dd>
          </div>
        ) : null}

        {application.appliedAt ? (
          <div className="flex items-center gap-1.5">
            <dt className="visually-hidden">Fecha de postulación</dt>
            <Icon name="briefcase" pack={iconPack} size={14} />
            <dd>Postulado el {formatDate(application.appliedAt)}</dd>
          </div>
        ) : null}

        {application.sourceUrl ? (
          <div className="flex items-center gap-1.5">
            <dt className="visually-hidden">Enlace de la vacante</dt>
            <Icon name="link" pack={iconPack} size={14} />
            <dd className="truncate">
              <a
                href={application.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring underline decoration-dotted underline-offset-2 hover:text-primary"
              >
                Ver publicación
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {application.notes ? (
        <p className="mt-2 line-clamp-3 rounded-control bg-sunken px-2 py-1.5 text-xs text-secondary">
          {application.notes}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <label className="flex-1">
          <span className="visually-hidden">
            Mover {application.position} a otra columna
          </span>
          <select
            value={application.status}
            onChange={(event) =>
              onStatusChange(application, event.target.value as ApplicationStatus)
            }
            className="focus-ring w-full rounded-control border border-subtle bg-base px-2 py-1 text-xs text-primary"
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_CATALOG[status].label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onEdit(application)}
          className="focus-ring rounded-control p-1.5 text-secondary hover:text-primary"
        >
          <Icon name="edit" pack={iconPack} size={16} title={`Editar ${application.position}`} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(application)}
          className="focus-ring rounded-control p-1.5 text-secondary hover:text-danger"
        >
          <Icon name="trash" pack={iconPack} size={16} title={`Eliminar ${application.position}`} />
        </button>
      </div>
    </article>
  );
}
