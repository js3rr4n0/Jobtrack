import type { ReactNode } from 'react';

import type { IconName } from './icon-names';

/**
 * Geometria de trazo inspirada en Feather Icons (licencia MIT).
 * Ver `ICONS_LICENSE.md` para la atribucion completa.
 */
export const OUTLINE_SHAPES: Record<IconName, ReactNode> = {
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  trash: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3a3 3 0 0 1-3 3" />
      <path d="M7 5H4a3 3 0 0 0 3 3" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </>
  ),
  flame: (
    <>
      <path d="M12 2c1.2 3.6 5 4.8 5 9a5 5 0 0 1-10 0c0-2 .8-3.2 1.8-4.2.2 1.8 1 2.7 1.9 2.7 0-3.2.4-5.4 1.3-7.5Z" />
    </>
  ),
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1Z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <polyline points="8.2 13.9 7 22 12 19 17 22 15.8 13.9" />
    </>
  ),
  shield: <path d="M12 2 20 6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4Z" />,
  notebook: (
    <>
      <path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2Z" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="12" y1="8" x2="16" y2="8" />
      <line x1="12" y1="12" x2="16" y2="12" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="7" y2="17" />
      <line x1="17" y1="7" x2="19.1" y2="4.9" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3c0-4.6-4-8.6-9-8.6Z" />
      <circle cx="8" cy="10" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16" cy="10" r="1" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </>
  ),
  offline: (
    <>
      <path d="M5 12.9a10 10 0 0 1 5.2-2.7" />
      <path d="M19 12.9a10 10 0 0 0-4.2-2.5" />
      <path d="M8.6 16.4a5 5 0 0 1 6.8 0" />
      <line x1="12" y1="20" x2="12" y2="20" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),
  refresh: (
    <>
      <polyline points="21 4 21 10 15 10" />
      <path d="M20.4 14a9 9 0 1 1-2.3-9.3L21 10" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
};
