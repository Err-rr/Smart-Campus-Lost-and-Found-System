import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line bg-white text-ink hover:bg-tile',
  ghost: 'text-ink-icon hover:bg-tile hover:text-ink',
};

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-5 text-[15px]',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant = 'primary', size = 'md', className = '', children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
