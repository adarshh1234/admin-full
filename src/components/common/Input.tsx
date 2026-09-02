import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    className = '',
    id,
    ...rest
  },
  ref,
) {
  const inputElement = (
    <input
      ref={ref}
      id={id}
      className={className || undefined}
      {...rest}
    />
  );

  if (!label && !error) {
    return inputElement;
  }

  return (
    <div className="input-group-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      {inputElement}
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});
