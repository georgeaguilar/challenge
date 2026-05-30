import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className={`rounded-lg border bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-violet-500 ${
          error ? 'border-red-500' : 'border-slate-700'
        } ${props.className ?? ''}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
