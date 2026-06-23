import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-5 py-3',
  lg: 'text-base px-6 py-4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
