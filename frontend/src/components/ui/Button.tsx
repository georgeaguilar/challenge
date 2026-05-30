import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

export default function Button({
  children,
  loading,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700',
    ghost: 'border border-slate-700 text-slate-300 hover:bg-slate-800',
  };

  return (
    <button {...props} disabled={loading || props.disabled} className={`${base} ${variants[variant]} ${props.className ?? ''}`}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
