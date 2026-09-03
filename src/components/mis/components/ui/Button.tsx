import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'tab';
  size?: 'sm' | 'md' | 'lg';
}

export default function MISButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = variant === 'primary' 
    ? 'mis-btn-action mis-btn-action-primary' 
    : variant === 'tab' 
    ? 'mis-tab-btn' 
    : 'mis-btn-action';

  return (
    <button type="button" className={`${baseClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
