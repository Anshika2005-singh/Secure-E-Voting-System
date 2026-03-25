import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType;
  variant?: 'body' | 'sm' | 'xs' | 'lead' | 'gradient';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
}

export const Text = ({ 
  as: Component = 'span', 
  variant = 'body', 
  weight = 'normal',
  className, 
  ...props 
}: TextProps) => {
  const variantClasses = {
    body: 'text-brand-text',
    sm: 'text-sm text-[#50667a]',
    xs: 'text-xs uppercase tracking-wider font-semibold',
    lead: 'text-xl text-[#50667a] leading-relaxed font-light',
    gradient: 'text-gradient font-bold',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  };

  return (
    <Component 
      className={cn(
        variantClasses[variant], 
        weightClasses[weight],
        className
      )} 
      {...props} 
    />
  );
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Heading = ({ 
  as: Component = 'h2', 
  size = 'md',
  className, 
  ...props 
}: HeadingProps) => {
  const sizeClasses = {
    xs: 'text-xl font-bold',
    sm: 'text-2xl font-bold',
    md: 'text-4xl lg:text-5xl font-bold',
    lg: 'text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight',
    xl: 'text-6xl lg:text-8xl font-black italic tracking-tighter',
    '2xl': 'text-7xl lg:text-9xl font-black',
  };

  return (
    <Component 
      className={cn(
        sizeClasses[size],
        'text-brand-text',
        className
      )} 
      {...props} 
    />
  );
};
