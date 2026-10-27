import { ComponentPropsWithoutRef, useId } from 'react';
import { mergeClasses } from '@/src/utils/css-utils';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  type: string;
  label: string;
  error?: string;
  containerClassName?: string;
}

export default function Input({
  id,
  label,
  name,
  type,
  error,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={mergeClasses('flex flex-col gap-1.5 w-full', containerClassName)}>
      <div>
        <label htmlFor={inputId}>{label}</label>
        <input
          type={type}
          name={name}
          id={inputId}
          aria-invalid={!!error}
          className={mergeClasses(
            'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors',
            'placeholder:text-neutral-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
            error && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-neutral-500 mt-0.5">{error}</p>}
    </div>
  );
}
