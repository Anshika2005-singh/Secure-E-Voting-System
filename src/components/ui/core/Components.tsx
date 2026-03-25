import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Box } from './Layout';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Badge ---
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'surface';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge = ({ variant = 'primary', size = 'sm', className, children, ...props }: BadgeProps) => {
  const variants = {
    primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    secondary: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    success: 'bg-brand-success/10 text-brand-success border-brand-success/20',
    danger: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20',
    outline: 'bg-transparent border-brand-surface text-brand-text',
    surface: 'bg-brand-surface/20 text-[#50667a] border-brand-surface/30',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <Box 
      as="span" 
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider rounded-md border transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </Box>
  );
};

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-[#6e94b5] shadow-sm',
    secondary: 'bg-brand-surface/20 border border-brand-surface/40 text-brand-text hover:bg-brand-surface/30',
    ghost: 'bg-transparent hover:bg-brand-surface/10 text-[#50667a]',
    glass: 'bg-white/40 backdrop-blur-md border border-white/20 hover:bg-white/60 text-brand-text',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <Box 
      as="button" 
      className={cn(
        'font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 hover:-translate-y-0.5',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
};

// --- Card ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card = ({ hover = true, glass = true, className, children, ...props }: CardProps) => {
  return (
    <Box 
      className={cn(
        'rounded-3xl border border-brand-surface/20 overflow-hidden bg-white/40',
        glass && 'backdrop-blur-xl',
        hover && 'hover:bg-white/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/30',
        'transition-all duration-500',
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
};
