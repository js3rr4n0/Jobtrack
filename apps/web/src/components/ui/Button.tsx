import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-inverse border border-accent hover:bg-accent-strong hover:border-accent-strong',
  secondary: 'bg-raised text-primary border border-strong hover:bg-accent-soft',
  ghost: 'bg-transparent text-secondary border border-transparent hover:bg-accent-soft hover:text-primary',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-inverse',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
