import React from 'react';
import { clsx } from 'clsx';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  multiline = false,
  rows = 4,
  className,
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all';

  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <Component
        className={clsx(baseStyles, error && 'border-status-rejected', className)}
        rows={multiline ? rows : undefined}
        {...(props as any)}
      />
      {error && (
        <p className="mt-1 text-sm text-status-rejected">{error}</p>
      )}
    </div>
  );
};
