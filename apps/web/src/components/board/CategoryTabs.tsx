'use client';

import {
  ALL_CATEGORIES,
  UNCATEGORIZED_CATEGORY,
  type CategorySummary,
} from '@jobtrack/contracts';

export interface CategoryTabsProps {
  categories: readonly CategorySummary[];
  uncategorized: number;
  total: number;
  active: string;
  onSelect: (category: string) => void;
}

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly total: number;
}

/**
 * Selector de area del tablero. Solo aparece cuando hay al menos un area
 * definida: mientras nadie clasifique sus postulaciones no hay nada que elegir.
 */
export function CategoryTabs({
  categories,
  uncategorized,
  total,
  active,
  onSelect,
}: CategoryTabsProps) {
  if (categories.length === 0) {
    return null;
  }

  const tabs: Tab[] = [
    { id: ALL_CATEGORIES, label: 'Todas', total },
    ...categories.map((category) => ({
      id: category.name,
      label: category.name,
      total: category.total,
    })),
  ];

  if (uncategorized > 0) {
    tabs.push({ id: UNCATEGORIZED_CATEGORY, label: 'Sin area', total: uncategorized });
  }

  return (
    <nav aria-label="Areas del tablero" className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(tab.id)}
            className={`focus-ring flex items-center gap-2 rounded-control border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? 'border-accent bg-accent text-inverse shadow-card'
                : 'border-subtle bg-raised text-secondary hover:border-strong hover:text-primary'
            }`}
          >
            <span className="max-w-[10rem] truncate">{tab.label}</span>
            <span
              className={`rounded-control px-1.5 text-xs font-semibold ${
                isActive ? 'bg-black/20' : 'bg-sunken'
              }`}
            >
              {tab.total}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
