import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function MISInput({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mis-input-group">
      {label && <label className="mis-input-label">{label}</label>}
      <input className={`mis-input ${error ? 'mis-input-error' : ''} ${className}`.trim()} {...props} />
      {error && <span className="mis-input-error-msg">{error}</span>}
    </div>
  );
}
