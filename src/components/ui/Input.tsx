import React from 'react';
import { cn } from '@/lib/utils';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  className,
  ...props
}) => {
  const inputClasses = cn(
    'block w-full rounded-md border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm theme-transition',
    'border-slate-300 bg-white text-slate-900 placeholder-slate-500',
    'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400',
    error && 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600',
    disabled && 'bg-slate-50 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium theme-text-primary mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export { Input };
export default Input;
