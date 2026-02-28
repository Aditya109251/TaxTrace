import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }: CardProps) => (
  <div className={cn("px-6 py-4 border-b border-slate-100", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }: CardProps) => (
  <div className={cn("px-6 py-4", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600'
  };
  
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
