import { ApplicationStatus, JobApplication, Priority, WorkMode } from '@deska/contracts';

import { JobApplicationPatch, NewJobApplicationRecord } from './job-applications.repository';

/** Representacion en PostgreSQL, con nombres de columna en snake_case. */
export interface JobApplicationRow {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  furthest_status: ApplicationStatus;
  location: string | null;
  work_mode: WorkMode | null;
  priority: Priority;
  salary_expectation: number | null;
  source_url: string | null;
  notes: string | null;
  category: string | null;
  contact: string | null;
  resume_version: string | null;
  cover_letter_version: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  interview_at: string | null;
  meeting_url: string | null;
  follow_up_at: string | null;
  applied_at: string | null;
  board_order: number;
  created_at: string;
  updated_at: string;
}

export function toDomain(row: JobApplicationRow): JobApplication {
  return {
    id: row.id,
    userId: row.user_id,
    company: row.company,
    position: row.position,
    status: row.status,
    furthestStatus: row.furthest_status,
    location: row.location,
    workMode: row.work_mode,
    priority: row.priority,
    salaryExpectation: row.salary_expectation,
    sourceUrl: row.source_url,
    notes: row.notes,
    category: row.category,
    contact: row.contact,
    resumeVersion: row.resume_version,
    coverLetterVersion: row.cover_letter_version,
    resumeId: row.resume_id,
    coverLetterId: row.cover_letter_id,
    interviewAt: row.interview_at,
    meetingUrl: row.meeting_url,
    followUpAt: row.follow_up_at,
    appliedAt: row.applied_at,
    boardOrder: row.board_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toInsertRow(record: NewJobApplicationRecord): Omit<
  JobApplicationRow,
  'id' | 'created_at' | 'updated_at'
> {
  return {
    user_id: record.userId,
    company: record.company,
    position: record.position,
    status: record.status,
    furthest_status: record.furthestStatus,
    location: record.location,
    work_mode: record.workMode,
    priority: record.priority,
    salary_expectation: record.salaryExpectation,
    source_url: record.sourceUrl,
    notes: record.notes,
    category: record.category,
    contact: record.contact,
    resume_version: record.resumeVersion,
    cover_letter_version: record.coverLetterVersion,
    resume_id: record.resumeId,
    cover_letter_id: record.coverLetterId,
    interview_at: record.interviewAt,
    meeting_url: record.meetingUrl,
    follow_up_at: record.followUpAt,
    applied_at: record.appliedAt,
    board_order: record.boardOrder,
  };
}

const PATCH_COLUMN_BY_FIELD: Readonly<Record<string, keyof JobApplicationRow>> = {
  company: 'company',
  position: 'position',
  status: 'status',
  furthestStatus: 'furthest_status',
  location: 'location',
  workMode: 'work_mode',
  priority: 'priority',
  salaryExpectation: 'salary_expectation',
  sourceUrl: 'source_url',
  notes: 'notes',
  category: 'category',
  contact: 'contact',
  resumeVersion: 'resume_version',
  coverLetterVersion: 'cover_letter_version',
  resumeId: 'resume_id',
  coverLetterId: 'cover_letter_id',
  interviewAt: 'interview_at',
  meetingUrl: 'meeting_url',
  followUpAt: 'follow_up_at',
  appliedAt: 'applied_at',
  boardOrder: 'board_order',
  updatedAt: 'updated_at',
};

/** Traduce solo los campos presentes en el parche, preservando actualizaciones parciales. */
export function toUpdateRow(patch: JobApplicationPatch): Partial<JobApplicationRow> {
  return Object.entries(patch).reduce<Partial<JobApplicationRow>>((row, [field, value]) => {
    const column = PATCH_COLUMN_BY_FIELD[field];
    if (column) {
      Object.assign(row, { [column]: value });
    }
    return row;
  }, {});
}
