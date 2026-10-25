import { ComponentPropsWithoutRef } from 'react';
import { mergeClasses } from "@/src/utils/css-utils";

const buttonVariants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500',
    outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus-visible:ring-blue-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
};

const buttonSizes = {
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-lg',
    icon: 'h-10 w-10 p-0 justify-center rounded-md'
};

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
    variant?: keyof typeof buttonVariants;
    size?: keyof typeof buttonSizes;
    isLoading?: boolean;
    label: string;
    className?: string;
}

export default function Button({ label, disabled, isLoading = false, className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={mergeClasses(
                'inline-flex items-center justify-center font-medium transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            {...props}>
            {label}
        </button>
    )
}