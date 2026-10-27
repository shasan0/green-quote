import { ComponentPropsWithoutRef } from 'react';
import { mergeClasses } from '@/src/utils/css-utils';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  isLoading?: boolean;
  label: string;
  className?: string;
}

export default function Button({
  label,
  disabled,
  isLoading = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button disabled={disabled || isLoading} className={mergeClasses('btn', className)} {...props}>
      {label}
    </button>
  );
}
