import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BoxProps extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as'> {
  as?: React.ElementType;
}

export const Box = ({ as: Component = 'div', className, ...props }: BoxProps) => {
  return <Component className={cn(className)} {...props} />;
};

interface FlexProps extends BoxProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number | string;
}

export const Flex = ({ 
  direction = 'row', 
  align = 'stretch', 
  justify = 'start', 
  gap, 
  className, 
  ...props 
}: FlexProps) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <Box 
      className={cn(
        'flex', 
        directionClasses[direction], 
        alignClasses[align], 
        justifyClasses[justify],
        gap && `gap-${gap}`,
        className
      )} 
      {...props} 
    />
  );
};

export const Stack = ({ className, ...props }: FlexProps) => {
  return <Flex direction="col" className={cn('w-full', className)} {...props} />;
};
